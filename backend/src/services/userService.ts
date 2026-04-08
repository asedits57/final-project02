import User from "../models/User";
import Leaderboard from "../models/Leaderboard";
import { safeGet, safeSet, safeDel } from "../config/redis";

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

export const getUserDashboard = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return {
    streak: user.streak,
    totalScore: user.score,
    lastActive: user.lastActive,
  };
};

export const updateProfileData = async (userId: string, data: any) => {
  const User = (await import("../models/User")).default;
  return await User.findByIdAndUpdate(userId, data, { new: true });
};

export const updateUserProgress = async (userId: string, score: number) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  const today = new Date().toDateString();
  const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
  const last = lastActiveDate ? lastActiveDate.toDateString() : null;

  if (last === today) {
    // same day
  } else if (
    lastActiveDate &&
    new Date(lastActiveDate).getDate() === new Date().getDate() - 1
  ) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.score += (score || 0);
  user.lastActive = new Date();

  await user.save();

  // UPSERT LEADERBOARD
  await Leaderboard.findOneAndUpdate(
    { userId },
    { score: user.score },
    { upsert: true, new: true }
  );

  // Invalidate leaderboard cache when score is updated
  await safeDel("leaderboard:top10");

  // Broadcast real-time update
  try {
    const { getIO } = await import("./socketService");
    getIO().emit("leaderboard_update", { userId, score: user.score });
  } catch (err) {
    console.warn("Socket broadcast failed:", err);
  }

  return user;
};

export const getLeaderboardCached = async () => {
  const cacheKey = "leaderboard";

  // Check Redis
  const cachedData = await safeGet(cacheKey);
  if (cachedData) {
    console.log("Serving Leaderboard from Cache 🚀");
    return JSON.parse(cachedData);
  }

  // Check DB using new Leaderboard schema
  const lbEntries = await Leaderboard.find()
    .populate("userId", "email streak level")
    .sort({ score: -1 })
    .limit(10);

  // Map to frontend expected format
  const users = lbEntries.map((e: any) => ({
    id: e.userId._id,
    email: e.userId.email,
    streak: e.userId.streak,
    level: e.userId.level,
    score: e.score,
  }));

  // Cache in Redis (60 seconds)
  await safeSet(cacheKey, JSON.stringify(users), {
    EX: 60,
  });
  console.log("Serving Leaderboard from DB and Caching 💾");

  return users;
};
