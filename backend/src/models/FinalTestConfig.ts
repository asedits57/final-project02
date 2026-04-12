import mongoose from "mongoose";

const finalTestAssignedQuestionSchema = new mongoose.Schema({
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

const finalTestFilterSchema = new mongoose.Schema({
  categories: {
    type: [String],
    default: [],
  },
  difficulties: {
    type: [String],
    enum: ["easy", "medium", "hard"],
    default: [],
  },
  questionTypes: {
    type: [String],
    enum: ["multiple_choice", "true_false", "short_answer", "fill_blank"],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
}, { _id: false });

const finalTestConfigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: "Platform Final Test",
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },
  enabled: {
    type: Boolean,
    default: false,
    index: true,
  },
  questionCount: {
    type: Number,
    min: 1,
    default: 10,
  },
  assignedQuestions: {
    type: [finalTestAssignedQuestionSchema],
    default: [],
  },
  filters: {
    type: finalTestFilterSchema,
    default: () => ({
      categories: [],
      difficulties: [],
      questionTypes: [],
      tags: [],
    }),
  },
  timeLimitMinutes: {
    type: Number,
    min: 1,
    default: 30,
  },
  passingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 60,
  },
  instructions: {
    type: String,
    trim: true,
    default: "Answer all questions carefully before submitting the final test.",
  },
  allowRetake: {
    type: Boolean,
    default: true,
  },
  publishedAt: {
    type: Date,
    required: false,
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

finalTestConfigSchema.index({ updatedAt: -1 });

export default mongoose.model("FinalTestConfig", finalTestConfigSchema);
