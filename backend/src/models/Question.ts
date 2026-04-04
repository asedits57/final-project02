import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  module: {
    type: String, // e.g., 'grammar', 'listening', 'reading', 'speaking', 'writing'
    required: true
  },
  difficulty: {
    type: String, // e.g., 'beginner', 'intermediate', 'advanced'
    required: true,
    default: 'beginner'
  },
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String,
    required: false
  },
  explanation: {
    type: String,
    required: false
  }
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);
