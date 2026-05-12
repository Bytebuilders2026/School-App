const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  getConversations,
  searchUsers,
} = require("../Controllers/messageController");

router.post("/send", authMiddleware, sendMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/history/:type/:id", authMiddleware, getMessages);
router.get("/search", authMiddleware, searchUsers);

module.exports = router;
