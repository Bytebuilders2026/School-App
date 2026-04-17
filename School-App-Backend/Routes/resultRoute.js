const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { addMarks, getClassMarks } = require("../Controllers/resultController");

router.post("/add", authMiddleware, addMarks);
router.get("/class/:className/section/:section", authMiddleware, getClassMarks);

module.exports = router;
