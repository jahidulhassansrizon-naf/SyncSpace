const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTPAndRegister,
  login,
} = require("../controllers/authController");

// Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPAndRegister);
router.post("/login", login);

module.exports = router;
