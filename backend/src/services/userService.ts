import User from "../models/User";
import Leaderboard from "../models/Leaderboard";
import { safeGet, safeSet, safeDel } from "../config/redis";
import { toPublicUser } from "../utils/toPublicUser";

const LEADERBOARD_CACHE_KEY = "leaderboard";

type LeaderboardRecord = {
  id: string;
  email: string;
  streak: number;
  level: number;
  score: number;
};

export type LeaderboardSnapshotUser = LeaderboardRecord & {
  isLive: boolean;
  liveModules: string[];
};

export type LeaderboardSnapshot = {
  users: LeaderboardSnapshotUser[];
  activeUsers: number;
  updatedAt: string;
};

const toLeaderboardRecord = (user: {
  _id?: { toString(): string };
  id?: string;
  email?: string;
  streak?: number;
  level?: number;
  score?: number;
}) => {
  const score = Math.max(0, Number(user.score || 0));

  return {
    id: user._id ? user._id.toString() : String(user.id || ""),
    email: user.email || "unknown@example.com",
    streak: user.streak || 0,
    level: Math.max(1, user.level || Math.floor(score / 100) + 1),
    score,
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return toPublicUser(user);
};

export const updateProfileData = async (userId: string, data: any) => {
  const User = (await import("../models/User")).default;
  return await User.findByIdAndUpdate(userId, data, { returnDocument: "after" });
};

export const updateUserProgress = async (userId: string, score: number) => {
  const user = await User.findById(userId);
  const parsedScore = Number(score);
  const awardedScore = Number.isFinite(parsedScore) ? Math.max(0, Math.round(parsedScore)) : 0;

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

  user.score += awardedScore;
  user.level = Math.max(1, Math.floor(user.score / 100) + 1);
  user.lastActive = new Date();

  await user.save();

  // UPSERT LEADERBOARD
  await Leaderboard.findOneAndUpdate(
    { userId },
    { score: user.score },
    { upsert: true, returnDocument: "after" }
  );

  // Invalidate leaderboard cache when score is updated
  await safeDel(LEADERBOARD_CACHE_KEY);

  // Broadcast real-time update
  try {
    const { emitLeaderboardSnapshot } = await import("./socketService");
    await emitLeaderboardSnapshot();
  } catch (err) {
    console.warn("Socket broadcast failed:", err);
  }

  return user;
};

export const getLeaderboardCached = async (): Promise<LeaderboardRecord[]> => {
  const cacheKey = LEADERBOARD_CACHE_KEY;

  // Check Redis
  const cachedData = await safeGet(cacheKey);
  if (cachedData) {
    console.log("Serving Leaderboard from Cache 🚀");
    return JSON.parse(cachedData);
  }

  // Check DB using new Leaderboard schema
  const lbEntries = await Leaderboard.find()
    .populate("userId", "email streak level score")
    .sort({ score: -1 })
    .limit(10);

  // Map to frontend expected format
  const users = lbEntries
    .filter((entry: any) => !!entry.userId)
    .map((entry: any) => toLeaderboardRecord({
      _id: entry.userId._id,
      email: entry.userId.email,
      streak: entry.userId.streak,
      level: entry.userId.level,
      score: entry.score,
    }));

  // Cache in Redis (60 seconds)
  await safeSet(cacheKey, JSON.stringify(users), {
    EX: 60,
  });
  console.log("Serving Leaderboard from DB and Caching 💾");

  return users;
};

export const getLeaderboardSnapshot = async (): Promise<LeaderboardSnapshot> => {
  const users = await getLeaderboardCached();
  const { getActiveParticipantIds, getActiveParticipantModules } = await import("./socketService");
  const activeIds = getActiveParticipantIds();
  const activeModules = getActiveParticipantModules();
  const knownIds = new Set(users.map((user) => user.id));
  const missingActiveIds = Array.from(activeIds).filter((id) => !knownIds.has(id));

  let activeUsersWithoutScores: LeaderboardRecord[] = [];
  if (missingActiveIds.length > 0) {
    const extraUsers = await User.find({ _id: { $in: missingActiveIds } }).select("email streak level score");
    activeUsersWithoutScores = extraUsers.map((user) => toLeaderboardRecord({
      _id: user._id,
      email: user.email,
      streak: user.streak,
      level: user.level,
      score: user.score,
    }));
  }

  const snapshotUsers = [...users, ...activeUsersWithoutScores]
    .map((user) => ({
      ...user,
      isLive: activeIds.has(user.id),
      liveModules: activeModules[user.id] || [],
    }))
    .sort((left, right) => {
      if (left.isLive !== right.isLive) {
        return left.isLive ? -1 : 1;
      }

      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.email.localeCompare(right.email);
    })
    .map((user) => ({
      ...user,
      level: Math.max(1, Math.floor(user.score / 100) + 1),
    }));

  return {
    users: snapshotUsers,
    activeUsers: activeIds.size,
    updatedAt: new Date().toISOString(),
  };
};
