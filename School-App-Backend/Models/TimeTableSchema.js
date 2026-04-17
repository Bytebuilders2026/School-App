// models/Timetable.js

const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  day: {
    type: String, // Monday, Tuesday...
    required: true,
  },
  periods: [
    {
      subject: String,
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teacher",
      },
      startTime: String,
      endTime: String,
    },
  ],
});

module.exports = mongoose.model("timetable", timetableSchema);