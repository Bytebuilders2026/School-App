// models/Student.js

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },

    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    class: {
      type: String,
      required: true,
      enum: [
        "Pre-Nursery",
        "Nursery",
        "KG",
        "1st",
        "2nd",
        "3rd",
        "4th",
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
      ],
    },
    section: {
      type: String, // e.g. "A"
      required: true,
    },

    // 🔹 Relations
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent",
    },

    // 🔹 Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔹 Optional Info
    phone: String,
    address: String,
    profileImage: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("student", studentSchema);
