import mongoose from "mongoose";

const notificationReadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  readAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { _id: false });

const notificationAudienceSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ["all", "users", "admins", "dept", "status"],
    default: "all",
    index: true,
  },
  dept: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
  },
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "critical"],
    default: "info",
    index: true,
  },
  actionLink: {
    type: String,
    trim: true,
  },
  audience: {
    type: notificationAudienceSchema,
    default: () => ({ scope: "all" }),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  readBy: {
    type: [notificationReadSchema],
    default: [],
  },
}, { timestamps: true });

notificationSchema.index({ createdAt: -1, type: 1 });
notificationSchema.index({ title: "text", message: "text" });

export default mongoose.model("Notification", notificationSchema);
