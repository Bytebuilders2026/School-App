// models/Attendance.js

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
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

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 Important: duplicate attendance prevent
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("attendance", attendanceSchema);
