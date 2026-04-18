const mongoose = require("mongoose");

const studentLeaveSchema = new mongoose.Schema(
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
    startDate: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("studentleave", studentLeaveSchema);
