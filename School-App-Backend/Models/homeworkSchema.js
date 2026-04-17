// models/Homework.js

const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    class: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    attachments: [
      {
        type: String, // file URLs
      },
    ],
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
      }
    ]
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("homework", homeworkSchema);
