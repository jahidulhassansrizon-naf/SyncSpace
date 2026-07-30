const express = require("express");
const router = express.Router();
const { getTeamMembers } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// টিম মেম্বারদের তালিকা পাওয়ার রুট
router.get("/", authMiddleware, getTeamMembers);

module.exports = router;
