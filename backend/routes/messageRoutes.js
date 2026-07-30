const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

// প্রজেক্টের মেসেজ দেখা
router.get("/:projectId", authMiddleware, getMessages);

// নতুন মেসেজ বা ফাইল পাঠানো ('file' নাম দিয়ে ফাইল রিসিভ হবে)
router.post("/", authMiddleware, upload.single("file"), sendMessage);

module.exports = router;
