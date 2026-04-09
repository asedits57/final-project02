import mongoose from "mongoose";

const assignedQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const dailyTaskSchema = new mongoose.Schema({
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
  activeDate: {
    type: Date,
    required: true,
    index: true,
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true,
  },
  rewardPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },
  resetMode: {
    type: String,
    enum: ["daily", "custom", "manual"],
    default: "daily",
  },
  assignedQuestions: {
    type: [assignedQuestionSchema],
    default: [],
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
}, { timestamps: true });

dailyTaskSchema.index({ status: 1, activeDate: 1, expiryDate: 1 });
dailyTaskSchema.index({ title: "text", description: "text" });

export default mongoose.model("DailyTask", dailyTaskSchema);
