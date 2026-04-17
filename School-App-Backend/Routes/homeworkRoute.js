const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { 
    createHomework, 
    getTeacherHomework, 
    deleteHomework, 
    getAllHomework,
    markAsComplete
} = require("../Controllers/homeworkController");

// Teacher specific routes
router.post("/create", authMiddleware, createHomework);
router.get("/teacher", authMiddleware, getTeacherHomework);
router.delete("/:id", authMiddleware, deleteHomework);
router.patch("/:id/complete", authMiddleware, markAsComplete);

// Global / Admin route
router.get("/all", authMiddleware, getAllHomework);

module.exports = router;
