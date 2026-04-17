const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getMyNotifications, markAsRead, markAllAsRead, triggerAutoPerformanceAlerts } = require("../Controllers/notificationController");

router.get("/mine", authMiddleware, getMyNotifications);
router.patch("/read-all", authMiddleware, markAllAsRead);
router.patch("/:id/read", authMiddleware, markAsRead);
router.post("/auto-trigger", authMiddleware, triggerAutoPerformanceAlerts);

module.exports = router;
