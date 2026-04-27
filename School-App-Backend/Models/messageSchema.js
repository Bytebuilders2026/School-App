// models/Message.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    conversationType: {
      type: String,
      enum: ["personal", "group"],
      required: true,
      default: "personal",
    },

    // For personal messages
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.conversationType === "personal";
      },
    },

    // For group messages (e.g., "Class-8th-A")
    groupId: {
      type: String,
      required: function () {
        return this.conversationType === "group";
      },
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
  }
);

module.exports = mongoose.model("message", messageSchema);
