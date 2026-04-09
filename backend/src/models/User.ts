import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  fullName: { type: String, required: false },
  username: { type: String, required: false },
  dept: { type: String, required: false },
  avatar: { type: String, required: false },
  oauthProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
  oauthSubject: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, required: false },
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    index: true,
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
    index: true,
  },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.index(
  { oauthProvider: 1, oauthSubject: 1 },
  {
    unique: true,
    partialFilterExpression: {
      oauthSubject: { $type: "string" },
    },
  },
);

userSchema.index({ role: 1, status: 1, createdAt: -1 });

export default mongoose.model("User", userSchema);
