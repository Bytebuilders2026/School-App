const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");

const {
  addStudent,
  getTotalStudents,
  searchStudent,
  getStudentsByClass,
  getStudentAttendance,
} = require("../Controllers/adminStudentController");

router.post("/add", authMiddleware, addStudent);
router.get("/total", authMiddleware, getTotalStudents);
router.get("/search", authMiddleware, searchStudent);
router.get("/by-class", authMiddleware, getStudentsByClass);
router.get("/attendance/:studentId", authMiddleware, getStudentAttendance);

module.exports = router;
