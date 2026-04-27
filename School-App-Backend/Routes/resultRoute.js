const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { addMarks, getClassMarks, getTopStudents, getRealtimeAnalysis } = require("../Controllers/resultController");

router.get("/top-students", authMiddleware, getTopStudents);
router.get("/realtime-analysis", authMiddleware, getRealtimeAnalysis);
router.post("/add", authMiddleware, addMarks);
router.get("/class/:className/section/:section", authMiddleware, getClassMarks);

module.exports = router;
