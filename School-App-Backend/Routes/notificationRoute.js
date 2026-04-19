const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getMyNotifications, markAsRead, markAllAsRead, triggerAutoPerformanceAlerts, sendAnnouncement } = require("../Controllers/notificationController");

router.get("/mine", authMiddleware, getMyNotifications);
router.patch("/read-all", authMiddleware, markAllAsRead);
router.patch("/:id/read", authMiddleware, markAsRead);
router.post("/auto-trigger", authMiddleware, triggerAutoPerformanceAlerts);
router.post("/announcement", authMiddleware, sendAnnouncement);
router.post("/announcements", authMiddleware, sendAnnouncement); // Support plural
router.get("/test", (req, res) => res.json({ message: "Notification route is active" }));

module.exports = router;
