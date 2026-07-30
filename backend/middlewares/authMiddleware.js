const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // ১. রিকোয়েস্টের হেডার (Header) থেকে টোকেন নেওয়া
  const token = req.header("Authorization");

  // ২. টোকেন না থাকলে এক্সেস ডিনাই (Deny) করা
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token mama, authorization denied!" });
  }

  try {
    // ৩. সাধারণত টোকেন 'Bearer <token>' ফরম্যাটে আসে, তাই 'Bearer ' অংশটুকু বাদ দিয়ে শুধু টোকেনটা নেওয়া
    const actualToken = token.startsWith("Bearer ")
      ? token.slice(7, token.length)
      : token;

    // ৪. আমাদের সিক্রেট কি (Secret Key) দিয়ে টোকেনটা ভেরিফাই করা
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // ৫. ইউজারের ডেটা রিকোয়েস্টে সেট করে দেওয়া, যাতে অন্যান্য ফাইলে এটা ব্যবহার করা যায়
    req.user = decoded.user;
    next(); // সব ঠিক থাকলে পরের কাজে যাওয়ার পারমিশন দেওয়া
  } catch (err) {
    res.status(401).json({ message: "Token is not valid!" });
  }
};
