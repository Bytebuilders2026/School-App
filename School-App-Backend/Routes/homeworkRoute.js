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

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Teacher specific routes
router.post("/create", createHomework);
router.get("/teacher", getTeacherHomework);
router.delete("/:id", deleteHomework);
router.patch("/:id/complete", markAsComplete);

// Global / Admin route
router.get("/all", getAllHomework);

module.exports = router;
