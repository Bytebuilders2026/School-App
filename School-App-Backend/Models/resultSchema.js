// models/Marks.js

const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    class: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    examType: {
      type: String, // Midterm, Final
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    grade: {
      type: String,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 Prevent duplicate marks for same exam
marksSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model("marks", marksSchema);
