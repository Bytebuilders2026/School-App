const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { addSyllabus, getSyllabus, deleteSyllabus } = require("../Controllers/syllabusController");

router.post("/add", authMiddleware, addSyllabus);
router.get("/class/:className", authMiddleware, getSyllabus);
router.delete("/:id", authMiddleware, deleteSyllabus);

module.exports = router;
