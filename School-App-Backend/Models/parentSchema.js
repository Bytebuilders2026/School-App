// models/Parent.js

const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
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

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔹 Relation (IMPORTANT)
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
      },
    ],

    // 🔹 Optional
    address: String,
    occupation: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("parent", parentSchema);
