const mongoose = require("mongoose");

const docRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
    docType: {
      type: String,
      required: true,
      enum: ["Character Certificate", "Transfer Certificate", "Bonafide Certificate", "Marksheet Copy", "Other"],
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    documentUrl: {
      type: String,
      default: "",
    },
    teacherNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("docRequest", docRequestSchema);
