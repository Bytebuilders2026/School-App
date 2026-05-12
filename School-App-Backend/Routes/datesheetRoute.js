const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { addDatesheet, getDatesheet, deleteDatesheet } = require("../Controllers/datesheetController");

router.post("/add", authMiddleware, addDatesheet);
router.get("/class/:className", authMiddleware, getDatesheet);
router.delete("/:id", authMiddleware, deleteDatesheet);

module.exports = router;
