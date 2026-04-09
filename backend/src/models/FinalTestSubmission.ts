import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: false,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, { _id: false });

const proctoringEventSchema = new mongoose.Schema({
  time: {
    type: String,
    trim: true,
    required: true,
  },
  message: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "danger"],
    required: true,
  },
  source: {
    type: String,
    enum: ["camera", "voice", "screen", "system"],
    required: true,
  },
}, { _id: false });

const recordingAssetSchema = new mongoose.Schema({
  url: {
    type: String,
    trim: true,
    required: true,
  },
  mimeType: {
    type: String,
    trim: true,
    required: false,
  },
  durationSeconds: {
    type: Number,
    required: false,
  },
  sizeBytes: {
    type: Number,
    required: false,
  },
}, { _id: false });

const finalTestSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  testTitle: {
    type: String,
    required: true,
    trim: true,
  },
  testCategory: {
    type: String,
    trim: true,
    default: "final-test",
    index: true,
  },
  answers: {
    type: [answerSchema],
    default: [],
  },
  aiEvaluation: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  score: {
    type: Number,
    default: 0,
    index: true,
  },
  flags: {
    type: [String],
    default: [],
  },
  recommendation: {
    type: String,
    trim: true,
    required: false,
  },
  responseTranscript: {
    type: String,
    trim: true,
    default: "",
  },
  proctoring: {
    riskScore: {
      type: Number,
      default: 0,
    },
    events: {
      type: [proctoringEventSchema],
      default: [],
    },
  },
  recordings: {
    audio: {
      type: recordingAssetSchema,
      required: false,
    },
    video: {
      type: recordingAssetSchema,
      required: false,
    },
  },
  reviewStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "reviewed", "re_evaluation_requested"],
    default: "pending",
    index: true,
  },
  adminNotes: {
    type: String,
    trim: true,
    required: false,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  reviewedAt: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

finalTestSubmissionSchema.index({ reviewStatus: 1, createdAt: -1 });
finalTestSubmissionSchema.index({ testCategory: 1, score: -1 });

export default mongoose.model("FinalTestSubmission", finalTestSubmissionSchema);
