import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: false },
  username: { type: String, required: false },
  dept: { type: String, required: false },
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  role: { type: String, default: "user" },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
