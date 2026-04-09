import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  requestId: { type: String, required: true, unique: true },
  purpose: { type: String, required: true, default: "google_oauth" },
  expiresAt: { type: Date, required: true, index: true },
  resendAvailableAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false, index: true },
  invalidatedAt: { type: Date, required: false },
  contextHash: { type: String, required: true },
}, { timestamps: true });

otpVerificationSchema.index({ userId: 1, purpose: 1, verified: 1 });
otpVerificationSchema.index({ email: 1, purpose: 1, verified: 1 });

export default mongoose.model("OtpVerification", otpVerificationSchema);
