const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { 
  getFeeStats, 
  getAllFees, 
  sendGlobalFeeReminders 
} = require("../Controllers/adminFeeController");

router.use(authMiddleware);

router.get("/stats", getFeeStats);
router.get("/all", getAllFees);
router.post("/send-reminders", sendGlobalFeeReminders);

module.exports = router;
