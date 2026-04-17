const express = require("express");
const router = express.Router();

const {
  createTimetable,
  getTimetable,
  deleteTimetable,
} = require("../Controllers/adminTimeTableController");

router.post("/create", createTimetable);
router.get("/get", getTimetable);
router.delete("/delete/:id", deleteTimetable);

module.exports = router;
