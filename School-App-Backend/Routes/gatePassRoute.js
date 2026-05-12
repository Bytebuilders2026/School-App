const express = require("express");
const router = express.Router();
const gatePassController = require("../Controllers/gatePassController");
const authMiddleware = require("../Middleware/authMiddleware");

// Public endpoints (no login required)
router.get("/student/:rollNo", gatePassController.getStudentByRollNo);
router.post("/request", gatePassController.requestGatePass);
router.post("/verify-otp", gatePassController.verifyOtp);
router.post("/approve/:token", gatePassController.approveGatePass);
router.post("/reject/:token", gatePassController.rejectGatePass);
router.get("/status/:id", gatePassController.getGatePassStatus);

router.get("/all", authMiddleware, gatePassController.getAllGatePasses);
router.put("/complete/:id", authMiddleware, gatePassController.completeGatePass);

// Parent portal endpoints
router.get("/parent/pending", authMiddleware, gatePassController.getPendingForParent);
router.post("/parent/approve/:id", authMiddleware, gatePassController.approveDirect);
router.post("/parent/reject/:id", authMiddleware, gatePassController.rejectDirect);

module.exports = router;
