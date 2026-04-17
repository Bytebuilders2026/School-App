const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: String,

    employeeId: {
      type: String,
      unique: true,
      required: true,
    },

    qualification: String,
    experience: Number,

    subjects: [String],

    classes: [
      {
        class: String,
        section: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    profileImage: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("teacher", teacherSchema);
