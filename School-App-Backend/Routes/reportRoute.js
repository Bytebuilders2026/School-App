const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getOverview, getClassReport } = require("../Controllers/reportController");

router.get("/overview", authMiddleware, getOverview);
router.get("/class/:className", authMiddleware, getClassReport);

module.exports = router;
