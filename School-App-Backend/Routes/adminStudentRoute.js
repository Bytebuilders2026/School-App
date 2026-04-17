const express = require("express");
const router = express.Router();

const {
  addStudent,
  getTotalStudents,
  searchStudent,
  getStudentsByClass,
  getStudentAttendance,
} = require("../Controllers/adminStudentController");

router.post("/add", addStudent);
router.get("/total", getTotalStudents);
router.get("/search", searchStudent);
router.get("/by-class", getStudentsByClass);
router.get("/attendance/:studentId", getStudentAttendance);

module.exports = router;
