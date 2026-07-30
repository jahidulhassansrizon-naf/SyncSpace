const User = require("../models/User");

// সব টিম মেম্বার বা ইউজারের তালিকা পাওয়ার ফাংশন
exports.getTeamMembers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // পাসওয়ার্ড বাদে ইউজারের সব তথ্য পাঠাবে
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
