const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../Middleware/authMiddleware");
const {
  uploadMaterial,
  getMyMaterials,
  deleteMaterial,
  getTeacherClasses,
  getStudentMaterials,
  downloadMaterial,
} = require("../Controllers/materialController");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/materials");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed: PDF, Word, PPT, Images, Text"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ── Teacher Routes ──
router.get("/teacher/classes", authMiddleware, getTeacherClasses);
router.get("/teacher/my", authMiddleware, getMyMaterials);
router.post("/teacher/upload", authMiddleware, upload.single("file"), uploadMaterial);
router.delete("/teacher/:id", authMiddleware, deleteMaterial);

// ── Student Routes ──
router.get("/student/my-class", authMiddleware, getStudentMaterials);

// ── Common: Download ──
router.get("/download/:id", authMiddleware, downloadMaterial);

module.exports = router;
