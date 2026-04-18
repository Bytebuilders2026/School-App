const express = require("express");
const router = express.Router();
const leaveController = require("../Controllers/leaveController");
const protect = require("../middleware/authMiddleware"); 

router.post("/student/request", protect, leaveController.requestStudentLeave);
router.post("/teacher/request", protect, leaveController.requestTeacherLeave);

router.get("/student/all", protect, leaveController.getStudentLeavesForTeacher);
router.get("/student/my-leaves", protect, leaveController.getMyLeavesForStudent);
router.get("/teacher/all", protect, leaveController.getTeacherLeavesForAdmin);

router.post("/student/approve", protect, leaveController.approveStudentLeave);
router.post("/teacher/approve", protect, leaveController.approveTeacherLeave);
router.post("/reject", protect, leaveController.rejectLeave);

module.exports = router;
