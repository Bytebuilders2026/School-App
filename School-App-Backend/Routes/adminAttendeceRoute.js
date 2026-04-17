const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getClassWiseAttendance,
  getClassStudentsAttendance,
  getAdminDashboard,
} = require("../Controllers/adminAttendenceController");

// FINAL URLS
router.get("/admin/stats", getDashboardStats);
router.get("/admin/class-wise", getClassWiseAttendance);
router.get("/admin/class-students", getClassStudentsAttendance);
router.get("/admin/dashboard", getAdminDashboard);

module.exports = router;
