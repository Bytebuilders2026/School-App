const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String }, // Links, topics, or standard text
  fileUrl: { type: String }, // Optional link to a document
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Admin
}, { timestamps: true });

module.exports = mongoose.model("Syllabus", syllabusSchema);
