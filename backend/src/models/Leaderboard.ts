import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Leaderboard", leaderboardSchema);
