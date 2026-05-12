const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const {
  createRequest,
  getStudentRequests,
  getTeacherRequests,
  updateRequest,
  getAllTeachers,
  getAllRequests,
} = require("../Controllers/docRequestController");

router.use(authMiddleware);

// Student Routes
router.post("/request", createRequest);
router.get("/student", getStudentRequests);
router.get("/teachers", getAllTeachers);

// Teacher Routes
router.get("/teacher", getTeacherRequests);
router.get("/all", getAllRequests);
router.put("/:id/update", updateRequest);

module.exports = router;
