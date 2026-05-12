const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const {
  getAllParents,
  addParent,
  deleteParent,
  getUnassignedStudents
} = require("../Controllers/adminParentController");

// Admins only routes for parent management
router.get("/all", authMiddleware, getAllParents);
router.post("/add", authMiddleware, addParent);
router.delete("/:id", authMiddleware, deleteParent);
router.get("/unassigned-students", authMiddleware, getUnassignedStudents);

module.exports = router;
