const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🚀 ক্লায়েন্ট ওয়ার্কফ্লো স্টার্ট/আনলক করেছে কিনা ট্র্যাক করার জন্য
    workflowUnlocked: {
      type: Boolean,
      default: false,
    },

    // 💡 চ্যাট কন্ট্রোল এবং কাউন্টারের জন্য ফিল্ডসমূহ:
    isChatEnabled: {
      type: Boolean,
      default: false,
    },
    unreadCountClient: {
      type: Number,
      default: 0,
    },
    unreadCountFreelancer: {
      type: Number,
      default: 0,
    },

    // 🚀 ক্লায়েন্ট ডিলিট রিকোয়েস্ট পাঠিয়েছে কি না তা ট্র্যাক করার জন্য
    deleteRequested: {
      type: Boolean,
      default: false,
    },

    // 🚀 পেমেন্ট স্ট্যাটাস এবং ফাইনাল প্রজেক্ট ফাইল রাখার জন্য
    isPaid: {
      type: Boolean,
      default: false,
    },
    projectFile: {
      fileUrl: { type: String, default: "" },
      fileName: { type: String, default: "" },
      uploadedAt: { type: Date },
      secretCode: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
