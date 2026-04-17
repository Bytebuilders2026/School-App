const mongoose = require("mongoose");

const substitutionSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    day: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    periodStartTime: String,
    periodEndTime: String,
    subject: String,
    absentTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
    substituteTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("substitution", substitutionSchema);
