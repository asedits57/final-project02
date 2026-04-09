import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: false,
  },
}, { _id: false });

const taskSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  targetType: {
    type: String,
    enum: ["task", "daily-task"],
    required: true,
    index: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: false,
  },
  dailyTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DailyTask",
    required: false,
  },
  answers: {
    type: [answerSchema],
    default: [],
  },
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  earnedPoints: {
    type: Number,
    default: 0,
  },
  completionState: {
    type: String,
    enum: ["submitted", "completed"],
    default: "completed",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

taskSubmissionSchema.index({ user: 1, task: 1 }, { unique: true, partialFilterExpression: { task: { $type: "objectId" } } });
taskSubmissionSchema.index({ user: 1, dailyTask: 1 }, { unique: true, partialFilterExpression: { dailyTask: { $type: "objectId" } } });
taskSubmissionSchema.index({ targetType: 1, submittedAt: -1 });

export default mongoose.model("TaskSubmission", taskSubmissionSchema);
