const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ১. কোন প্রজেক্টের চ্যাট?
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // ২. মেসেজটি কে পাঠাল? (Client নাকি Freelancer)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ৩. মেসেজের টেক্সট
    text: {
      type: String,
      trim: true,
    },
    // ৪. ফাইল/ছবি পাঠালে তার তথ্য (যদি থাকে)
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // এটি দিয়ে মেসেজ পাঠানোর সময় (createdAt) অটো সেভ হবে
  },
);

module.exports = mongoose.model("Message", messageSchema);
