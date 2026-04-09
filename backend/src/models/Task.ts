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

const taskSchema = new mongoose.Schema({
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
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
    index: true,
  },
  dueDate: {
    type: Date,
    required: false,
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

taskSchema.index({ status: 1, dueDate: 1, category: 1, difficulty: 1 });
taskSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.model("Task", taskSchema);
