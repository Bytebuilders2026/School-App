const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getDashboard, getTimetable, getHomework, getAttendance, getMarks } = require("../Controllers/studentPortalController");

// Use auth middleware for all routes
router.use(authMiddleware);

router.get("/dashboard", getDashboard);
router.get("/timetable", getTimetable);
router.get("/homework", getHomework);
router.get("/attendance", getAttendance);
router.get("/marks", getMarks);

module.exports = router;
