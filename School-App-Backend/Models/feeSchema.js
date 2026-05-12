const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    month: {
      type: String, // e.g., "April"
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    tuitionFee: {
      type: Number,
      required: true,
      default: 2000,
    },
    transportFee: {
      type: Number,
      default: 1000,
    },
    developmentFee: {
      type: Number,
      default: 500,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "feePayment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for total base charges
feeSchema.virtual("totalBaseCharges").get(function () {
  return this.tuitionFee + this.transportFee + this.developmentFee;
});

module.exports = mongoose.model("fee", feeSchema);