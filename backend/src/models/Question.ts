import mongoose from "mongoose";

const normalizeDifficulty = (value?: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "beginner") return "easy";
  if (normalized === "intermediate") return "medium";
  if (normalized === "advanced") return "hard";
  if (normalized === "easy" || normalized === "medium" || normalized === "hard") return normalized;

  return "medium";
};

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  questionType: {
    type: String,
    enum: ["multiple_choice", "true_false", "short_answer", "fill_blank"],
    default: "multiple_choice",
    index: true,
  },
  options: {
    type: [String],
    default: [],
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  explanation: {
    type: String,
    trim: true,
    required: false,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
    default: "medium",
    index: true,
  },
  category: {
    type: String,
    trim: true,
    default: "general",
    index: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  points: {
    type: Number,
    default: 1,
    min: 0,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },
  targetType: {
    type: String,
    enum: ["task", "daily-task", "final-test", "both", "all"],
    default: "both",
    index: true,
  },
  timeLimit: {
    type: Number,
    min: 0,
    required: false,
  },
  priority: {
    type: Number,
    default: 0,
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
  // Legacy compatibility fields still used by seeded content and older frontend fetch paths.
  module: {
    type: String,
    trim: true,
    default: "general",
  },
  text: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

questionSchema.pre("validate", function () {
  this.difficulty = normalizeDifficulty(this.difficulty);
  this.questionText = String(this.questionText || this.text || "").trim();
  this.text = String(this.text || this.questionText || "").trim();
  this.category = String(this.category || this.module || "general").trim();
  this.module = String(this.module || this.category || "general").trim();

  if (!this.title) {
    this.title = this.questionText.slice(0, 80) || "Untitled question";
  }

  if (this.questionType === "true_false" && this.options.length === 0) {
    this.options = ["True", "False"];
  }
});

questionSchema.index({ category: 1, status: 1, difficulty: 1, targetType: 1 });
questionSchema.index({ title: "text", questionText: "text", tags: "text", category: "text" });

export default mongoose.model("Question", questionSchema);
