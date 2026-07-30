const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// কন্ট্রোলার ফাংশনগুলো ইমপোর্ট করা হলো
const {
  createProject,
  getProjects,
  updateProjectStatus,
  deleteProject,
  updateProjectDetails,
  getDashboardStats,
  clearUnreadCount,
  allowDeleteProject,
  uploadProjectFile,
  updatePaymentStatus,
  downloadProjectFile,
  deleteProjectFile,
  unlockWorkflow, // 🚀 নতুন ওয়ার্কফ্লো আনলক কন্ট্রোলার যোগ হলো
} = require("../controllers/projectController");

// রাউট সমূহ
router.get("/stats", authMiddleware, getDashboardStats);

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.patch("/:id/status", authMiddleware, updateProjectStatus);
router.delete("/:id", authMiddleware, deleteProject);

// ফ্রিল্যান্সার কর্তৃক ডিলিট পারমিশন দিয়ে প্রজেক্ট রিমুভ করার রাউট
router.delete("/:id/allow-delete", authMiddleware, allowDeleteProject);

router.put("/:id", authMiddleware, updateProjectDetails);
router.patch("/:id/clear-unread", authMiddleware, clearUnreadCount);

// 🚀 ক্লায়েন্টের প্রজেক্ট ওয়ার্কফ্লো আনলক করার রাউট
router.patch("/:id/unlock", authMiddleware, unlockWorkflow);

// ফাইল আপলোড, পেমেন্ট, ডাউনলোড এবং ডিলিট রুটসমূহ
router.post(
  "/:id/upload-file",
  authMiddleware,
  upload.single("file"),
  uploadProjectFile,
);
router.patch("/:id/pay", authMiddleware, updatePaymentStatus);
router.get("/:id/download", authMiddleware, downloadProjectFile);
router.delete("/:id/delete-file", authMiddleware, deleteProjectFile);

module.exports = router;
