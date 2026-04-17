// models/Message.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },

    senderModel: {
      type: String,
      required: true,
      enum: ["student", "teacher", "parent"],
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    },

    receiverModel: {
      type: String,
      required: true,
      enum: ["student", "teacher", "parent"],
    },

    message: {
      type: String,
      required: true,
    },

    attachments: [
      {
        type: String, // file URLs
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("message", messageSchema);
