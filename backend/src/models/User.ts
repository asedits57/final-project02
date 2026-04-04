import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  fullName: { type: String, required: false },
  username: { type: String, required: false },
  dept: { type: String, required: false },
  avatar: { type: String, required: false },
  oauthProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  role: { type: String, default: "user" },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
