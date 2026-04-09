import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    index: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  targetType: {
    type: String,
    required: true,
    trim: true,
  },
  targetId: {
    type: String,
    required: false,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
}, { timestamps: true });

adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ action: 1, targetType: 1, createdAt: -1 });

export default mongoose.model("AdminActivity", adminActivitySchema);
