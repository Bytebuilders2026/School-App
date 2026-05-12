const express = require("express");
const router = express.Router();
const { getTeacherDashboard, getTeacherTimetable, markAttendance, getTeacherMe } = require("../Controllers/teacherDashboardController");
const authMiddleware = require("../Middleware/authMiddleware");

router.get("/me", authMiddleware, getTeacherMe);

router.get("/dashboard", authMiddleware, getTeacherDashboard);
router.get("/timetable", authMiddleware, getTeacherTimetable);
router.post("/attendance", authMiddleware, markAttendance);

module.exports = router;