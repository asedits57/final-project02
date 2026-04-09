import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  contentType: {
    type: String,
    enum: ["guide", "video"],
    required: true,
    index: true,
  },
  contentKey: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    default: "general",
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningVideo",
    required: false,
  },
  pointsAwarded: {
    type: Number,
    min: 0,
    default: 0,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

learningProgressSchema.index({ user: 1, contentType: 1, contentKey: 1 }, { unique: true });
learningProgressSchema.index({ user: 1, completedAt: -1 });

export default mongoose.model("LearningProgress", learningProgressSchema);
