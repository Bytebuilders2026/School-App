const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getStudentPerformance, askPerformanceChatbot, getAdminStats, getClassRiskStats } = require("../Controllers/performanceController");

router.get("/me", authMiddleware, getStudentPerformance);
router.get("/student/:studentId", authMiddleware, getStudentPerformance);
router.get("/class-risk", authMiddleware, getClassRiskStats);
router.get("/admin/stats", authMiddleware, getAdminStats);
router.post("/chatbot", authMiddleware, askPerformanceChatbot);

module.exports = router;
