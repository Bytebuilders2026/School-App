const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");

const {
  createTimetable,
  getTimetable,
  deleteTimetable,
  getAllTimetables,
} = require("../Controllers/adminTimeTableController");

router.use(authMiddleware);

router.post("/create", createTimetable);
router.get("/get", getTimetable);
router.get("/all", getAllTimetables);
router.delete("/delete/:id", deleteTimetable);

module.exports = router;
