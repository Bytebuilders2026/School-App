const express = require("express");
const router = express.Router();
const controller = require("../Controllers/autoTimetableController");

router.post("/leave/request", controller.requestLeave);
router.get("/leave/all", controller.getLeaves);
router.get("/leave/:leaveId/suggestions", controller.getSuggestions);
router.post("/leave/approve", controller.approveLeaveAndSubstitute);
router.get("/substitutions/:teacherId", controller.getSubstitutionsForTeacher);
router.post("/generate", controller.autoGenerateTimetable);

module.exports = router;
