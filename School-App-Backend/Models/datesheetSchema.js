const mongoose = require("mongoose");

const datesheetSchema = new mongoose.Schema({
  class: { type: String, required: true },
  examType: { type: String, required: true }, // Midterm, Final, Unit Test
  schedule: [
    {
      date: { type: Date, required: true },
      subject: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      syllabusInfo: { type: String } // Quick topic overview
    }
  ],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Admin
}, { timestamps: true });

module.exports = mongoose.model("Datesheet", datesheetSchema);
