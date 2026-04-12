import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: false,
  },
  relatedFinalTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FinalTestSubmission",
    required: false,
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  issueDate: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "issued", "failed"],
    default: "pending",
    index: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  fileUrl: {
    type: String,
    trim: true,
    required: false,
  },
  filePath: {
    type: String,
    trim: true,
    required: false,
  },
  title: {
    type: String,
    trim: true,
    required: false,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
}, { timestamps: true });

certificateSchema.index({ status: 1, issueDate: -1 });

export default mongoose.model("Certificate", certificateSchema);
