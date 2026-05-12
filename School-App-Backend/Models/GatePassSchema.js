const mongoose = require("mongoose");

const gatePassSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  purpose: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "student", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "parent", required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed"], default: "Pending" },
  otp: { type: String },
  otpVerified: { type: Boolean, default: false },
  approvalToken: { type: String },
  tokenExpiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("GatePass", gatePassSchema, "gate_pass_requests");
