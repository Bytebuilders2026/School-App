const express = require("express");
const router = express.Router();

const {
  createTeacher,
  getAllTeachers,
  deleteTeacher,
  searchTeacher,
  updateTeacher,
  getTeacherDetail,
} = require("../Controllers/adminTeacherController");

router.post("/create", createTeacher);
router.get("/all", getAllTeachers);
router.get("/search", searchTeacher);
router.delete("/delete/:id", deleteTeacher);
router.put("/update/:id", updateTeacher);
router.get("/detail/:id", getTeacherDetail);

module.exports = router;
