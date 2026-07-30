const multer = require("multer");
const path = require("path");

// পিসির 'uploads/' ফোল্ডারে ফাইল সেভ করার কনফিগারেশন
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // ফাইলের নামের সাথে সময় যোগ করে ইউনিক (Unique) নাম তৈরি
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
