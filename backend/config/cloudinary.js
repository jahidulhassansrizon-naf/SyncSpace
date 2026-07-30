const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "syncspace_chat_files",
    resource_type: "auto", // ইমেজ, পিডিএফ, ইত্যাদি অটো-ডিটেক্ট করবে
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
