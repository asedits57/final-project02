import mongoose from "mongoose";

const adminInviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "expired", "revoked"],
    default: "pending",
    index: true,
  },
  responseTokenHash: {
    type: String,
    required: true,
    index: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  acceptedAt: {
    type: Date,
    required: false,
  },
  declinedAt: {
    type: Date,
    required: false,
  },
  respondedAt: {
    type: Date,
    required: false,
  },
  message: {
    type: String,
    trim: true,
    required: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  lastSentAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

adminInviteSchema.index({ email: 1, status: 1, expiresAt: -1 });
adminInviteSchema.index({ responseTokenHash: 1, status: 1 });
adminInviteSchema.index({ invitedBy: 1, createdAt: -1 });

export default mongoose.model("AdminInvite", adminInviteSchema);
