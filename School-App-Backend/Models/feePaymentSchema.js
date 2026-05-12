// models/FeePayment.js

const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    method: {
      type: String,
      enum: ["cash", "online", "upi", "card"],
      default: "cash",
    },

    transactionId: {
      type: String, // for online payments
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("feePayment", feePaymentSchema);
