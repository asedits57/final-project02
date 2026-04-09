import mongoose from "mongoose";

const learningVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    default: "general",
    index: true,
  },
  level: {
    type: String,
    trim: true,
    default: "beginner",
    index: true,
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true,
  },
  sourceType: {
    type: String,
    enum: ["external", "upload"],
    default: "external",
    index: true,
  },
  duration: {
    type: Number,
    min: 0,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  visibility: {
    type: String,
    enum: ["public", "authenticated", "private"],
    default: "authenticated",
    index: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  storage: {
    originalFileName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      min: 0,
    },
  },
}, { timestamps: true });

learningVideoSchema.index({ status: 1, visibility: 1, category: 1, level: 1, sourceType: 1 });
learningVideoSchema.index({ title: "text", description: "text", category: "text", tags: "text" });

export default mongoose.model("LearningVideo", learningVideoSchema);
