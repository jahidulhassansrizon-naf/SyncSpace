const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "freelancer", "client"],
      default: "freelancer",
    },
    avatar: { type: String, default: "" },
    // 🟢 রিয়েল-টাইম অনলাইন স্ট্যাটাসের জন্য নতুন ফিল্ড
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
