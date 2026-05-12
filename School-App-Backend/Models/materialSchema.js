const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
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
    // Uploaded by which teacher
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
    // File info (stored via multer)
    fileName: { type: String },       // original file name
    filePath: { type: String },       // path on server disk
    fileType: { type: String },       // mime type
    fileSize: { type: Number },       // bytes
    // Or external link
    externalLink: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("material", materialSchema);
