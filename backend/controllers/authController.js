const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 Temporary OTP Storage (Memory)
const otpStore = new Map();

// 🟢 Step 1: Send OTP for Registration
exports.sendOTP = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // প্রতিবার .env থেকে URL নেওয়া হবে
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    console.log("GOOGLE_SCRIPT_URL:", GOOGLE_SCRIPT_URL);

    if (!GOOGLE_SCRIPT_URL) {
      console.error("GOOGLE_SCRIPT_URL is missing in environment variables");
      return res.status(500).json({
        success: false,
        message: "Email service configuration missing.",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      userData: { name, email, password, role },
      otp: generatedOTP,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>SyncSpace Email Verification</h2>
        <p>Hello <b>${name}</b>,</p>
        <p>Your OTP is:</p>

        <h1 style="color:green; letter-spacing:5px;">
          ${generatedOTP}
        </h1>

        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `;

    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        subject: `${generatedOTP} is your SyncSpace verification code`,
        html: emailHTML,
      }),
    });

    const responseText = await googleResponse.text();

    console.log("Google Response:", responseText);

    let googleResult;

    try {
      googleResult = JSON.parse(responseText);
    } catch (err) {
      console.error("Invalid JSON:", responseText);

      otpStore.delete(email);

      return res.status(500).json({
        success: false,
        message: "Google Script did not return valid JSON.",
      });
    }

    if (!googleResult.success) {
      otpStore.delete(email);

      return res.status(500).json({
        success: false,
        message: "Failed to send email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("========== EMAIL ERROR ==========");
    console.error(error);

    if (req.body?.email) {
      otpStore.delete(req.body.email);
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🟢 Step 2: Verify OTP & Register User
exports.verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ message: "OTP expired or not requested!" });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res
        .status(400)
        .json({ message: "OTP has expired! Please try again." });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP code!" });
    }

    const { name, password, role } = record.userData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    otpStore.delete(email);

    res
      .status(201)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// 🔵 User Login Logic (Unchanged)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      },
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
