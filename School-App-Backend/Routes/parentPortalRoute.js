const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { 
  getParentDashboard, 
  getChildFullDetails, 
  simulateFeePayment 
} = require("../Controllers/parentPortalController");

router.use(authMiddleware);

router.get("/dashboard", getParentDashboard);
router.get("/child/:id", getChildFullDetails);
router.post("/pay-fee/:feeId", simulateFeePayment);

module.exports = router;
