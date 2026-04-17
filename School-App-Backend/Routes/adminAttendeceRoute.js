const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");

const {
  getDashboardStats,
  getClassWiseAttendance,
  getClassStudentsAttendance,
  getAdminDashboard,
} = require("../Controllers/adminAttendenceController");

router.use(authMiddleware);

router.get("/admin/stats", getDashboardStats);
router.get("/admin/class-wise", getClassWiseAttendance);
router.get("/admin/class-students", getClassStudentsAttendance);
router.get("/admin/dashboard", getAdminDashboard);

module.exports = router;
