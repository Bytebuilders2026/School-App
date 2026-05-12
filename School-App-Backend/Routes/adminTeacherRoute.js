const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");

const {
  createTeacher,
  getAllTeachers,
  deleteTeacher,
  searchTeacher,
  updateTeacher,
  getTeacherDetail,
} = require("../Controllers/adminTeacherController");

router.post("/create", authMiddleware, createTeacher);
router.get("/all", authMiddleware, getAllTeachers);
router.get("/search", authMiddleware, searchTeacher);
router.delete("/delete/:id", authMiddleware, deleteTeacher);
router.put("/update/:id", authMiddleware, updateTeacher);
router.get("/detail/:id", authMiddleware, getTeacherDetail);

module.exports = router;
