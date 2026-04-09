import User from "../models/User";
import LearningVideo from "../models/LearningVideo";
import LearningProgress from "../models/LearningProgress";
import ApiError from "../utils/ApiError";
import { updateUserProgress } from "./userService";

type GuideDefinition = {
  key: string;
  title: string;
  category: string;
  pointsAwarded: number;
};

const LEARNING_GUIDES: Record<string, GuideDefinition> = {
  "grammar-masterclass": {
    key: "grammar-masterclass",
    title: "Grammar Masterclass",
    category: "grammar",
    pointsAwarded: 25,
  },
  "vocabulary-builder": {
    key: "vocabulary-builder",
    title: "Vocabulary Builder",
    category: "vocabulary",
    pointsAwarded: 25,
  },
  "exam-strategies": {
    key: "exam-strategies",
    title: "Exam Strategies",
    category: "strategy",
    pointsAwarded: 30,
  },
  "daily-tips": {
    key: "daily-tips",
    title: "Daily Tips",
    category: "micro-learning",
    pointsAwarded: 20,
  },
};

const serializeProgress = (progress: {
  _id?: { toString(): string };
  contentType?: string;
  contentKey?: string;
  title?: string;
  category?: string;
  pointsAwarded?: number;
  completedAt?: Date | string;
  video?: { toString(): string } | string | null;
}) => ({
  _id: progress._id?.toString() || "",
  contentType: progress.contentType || "guide",
  contentKey: progress.contentKey || "",
  title: progress.title || "",
  category: progress.category || "general",
  pointsAwarded: Number(progress.pointsAwarded || 0),
  completedAt:
    progress.completedAt instanceof Date
      ? progress.completedAt.toISOString()
      : String(progress.completedAt || new Date().toISOString()),
  videoId:
    typeof progress.video === "string"
      ? progress.video
      : progress.video?.toString(),
});

const serializeUserScore = (user: {
  _id: { toString(): string };
  score?: number;
  level?: number;
  streak?: number;
}) => ({
  id: user._id.toString(),
  score: Number(user.score || 0),
  level: Number(user.level || 1),
  streak: Number(user.streak || 0),
});

const computeVideoCompletionPoints = (durationSeconds: number) => {
  if (durationSeconds >= 600) {
    return 60;
  }

  if (durationSeconds >= 300) {
    return 45;
  }

  if (durationSeconds >= 120) {
    return 35;
  }

  return 25;
};

const getExistingProgressWithUser = async (progressId: string, userId: string) => {
  const [progress, user] = await Promise.all([
    LearningProgress.findById(progressId).lean(),
    User.findById(userId).select("score level streak").lean(),
  ]);

  if (!progress) {
    throw new ApiError(404, "Learning progress not found");
  }

  return {
    completion: serializeProgress(progress),
    alreadyCompleted: true,
    awardedPoints: 0,
    user: user ? serializeUserScore({ ...user, _id: user._id }) : undefined,
  };
};

export const getLearningProgressSummary = async (userId: string) => {
  const progressItems = await LearningProgress.find({ user: userId }).sort({ completedAt: -1 }).lean();
  const completedGuides = progressItems.filter((item) => item.contentType === "guide").map(serializeProgress);
  const completedVideos = progressItems.filter((item) => item.contentType === "video").map(serializeProgress);

  return {
    completedGuides,
    completedVideos,
    totalLearningPoints: progressItems.reduce((total, item) => total + Number(item.pointsAwarded || 0), 0),
  };
};

export const completeLearningGuideForUser = async (userId: string, guideKey: string) => {
  const guide = LEARNING_GUIDES[guideKey];
  if (!guide) {
    throw new ApiError(404, "Learning guide not found");
  }

  const existing = await LearningProgress.findOne({
    user: userId,
    contentType: "guide",
    contentKey: guide.key,
  }).select("_id");

  if (existing) {
    return getExistingProgressWithUser(existing._id.toString(), userId);
  }

  const completion = await LearningProgress.create({
    user: userId,
    contentType: "guide",
    contentKey: guide.key,
    title: guide.title,
    category: guide.category,
    pointsAwarded: guide.pointsAwarded,
    completedAt: new Date(),
  });

  const updatedUser = await updateUserProgress(userId, guide.pointsAwarded);

  return {
    completion: serializeProgress(completion),
    alreadyCompleted: false,
    awardedPoints: guide.pointsAwarded,
    user: serializeUserScore(updatedUser),
  };
};

export const completeLearningVideoForUser = async (userId: string, videoId: string) => {
  const video = await LearningVideo.findOne({
    _id: videoId,
    status: "published",
    visibility: { $in: ["public", "authenticated"] },
  }).lean();

  if (!video) {
    throw new ApiError(404, "Learning video not found");
  }

  const existing = await LearningProgress.findOne({
    user: userId,
    contentType: "video",
    contentKey: video._id.toString(),
  }).select("_id");

  if (existing) {
    return getExistingProgressWithUser(existing._id.toString(), userId);
  }

  const pointsAwarded = computeVideoCompletionPoints(Number(video.duration || 0));

  const completion = await LearningProgress.create({
    user: userId,
    contentType: "video",
    contentKey: video._id.toString(),
    title: video.title,
    category: video.category || "general",
    video: video._id,
    pointsAwarded,
    completedAt: new Date(),
  });

  const updatedUser = await updateUserProgress(userId, pointsAwarded);

  return {
    completion: serializeProgress(completion),
    alreadyCompleted: false,
    awardedPoints: pointsAwarded,
    user: serializeUserScore(updatedUser),
  };
};
