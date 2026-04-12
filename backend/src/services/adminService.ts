import mongoose from "mongoose";

import Certificate from "../models/Certificate";
import DailyTask from "../models/DailyTask";
import FinalTestSubmission from "../models/FinalTestSubmission";
import Leaderboard from "../models/Leaderboard";
import LearningVideo from "../models/LearningVideo";
import Notification from "../models/Notification";
import Question from "../models/Question";
import Task from "../models/Task";
import TaskSubmission from "../models/TaskSubmission";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { logger } from "../utils/logger";
import { serializeError } from "../utils/logging";
import { buildSearchRegex, getPagination } from "../utils/query";
import { getLeaderboardSnapshot } from "./userService";
import { getRecentAdminActivity, recordAdminActivity } from "./adminActivityService";
import { safeDel } from "../config/redis";
import { getRecentAdminNotifications } from "./notificationService";

const LEADERBOARD_CACHE_KEY = "leaderboard";

const invalidateLeaderboard = async () => {
  await safeDel(LEADERBOARD_CACHE_KEY);

  try {
    const { emitLeaderboardSnapshot } = await import("./socketService");
    await emitLeaderboardSnapshot();
  } catch (error) {
    logger.warn("Failed to refresh leaderboard snapshot", serializeError(error));
  }
};

const serializeAdminUser = (user: Record<string, unknown>) => ({
  ...user,
  role: user.role === "admin" ? "admin" : "user",
  status: user.status === "suspended" ? "suspended" : "active",
  score: Math.max(0, Number(user.score || 0)),
  level: Math.max(1, Number(user.level || 1)),
  streak: Math.max(0, Number(user.streak || 0)),
});

const ensureObjectIdExists = (value?: string) => {
  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, "Invalid id");
  }
};

export const getAdminDashboardOverview = async (recentActivityLimit = 8) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalQuestions,
    publishedQuestions,
    totalTasks,
    totalDailyTasks,
    totalLearningVideos,
    totalNotifications,
    totalFinalTestSubmissions,
    pendingFinalTestReviews,
    certificatesIssued,
    leaderboardSummary,
    recentActivity,
    recentNotifications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active", lastActive: { $gte: sevenDaysAgo } }),
    Question.countDocuments(),
    Question.countDocuments({ status: "published" }),
    Task.countDocuments(),
    DailyTask.countDocuments(),
    LearningVideo.countDocuments(),
    Notification.countDocuments(),
    FinalTestSubmission.countDocuments(),
    FinalTestSubmission.countDocuments({ reviewStatus: "pending" }),
    Certificate.countDocuments({ status: "issued" }),
    getLeaderboardSnapshot(),
    getRecentAdminActivity(recentActivityLimit),
    getRecentAdminNotifications(Math.min(recentActivityLimit, 5)),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalQuestions,
    publishedQuestions,
    totalTasks,
    totalDailyTasks,
    totalLearningVideos,
    totalNotifications,
    totalFinalTestSubmissions,
    pendingFinalTestReviews,
    certificatesIssued,
    leaderboard: {
      activeUsers: leaderboardSummary.activeUsers,
      topUsers: leaderboardSummary.users.slice(0, 5),
      updatedAt: leaderboardSummary.updatedAt,
    },
    recentActivity,
    recentNotifications,
  };
};

type AdminUserFilters = {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  dept?: string;
};

export const listAdminUsers = async (filters: AdminUserFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const searchRegex = buildSearchRegex(filters.search);
  const query: Record<string, unknown> = {};

  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.dept) query.dept = filters.dept;
  if (searchRegex) {
    query.$or = [
      { email: searchRegex },
      { fullName: searchRegex },
      { username: searchRegex },
      { dept: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  return {
    items: items.map((user) => serializeAdminUser(user as unknown as Record<string, unknown>)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminUserById = async (userId: string) => {
  const [user, submissionSummary, certificateCount, finalTestCount] = await Promise.all([
    User.findById(userId).select("-password").lean(),
    TaskSubmission.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    Certificate.countDocuments({ user: userId }),
    FinalTestSubmission.countDocuments({ user: userId }),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    ...serializeAdminUser(user as unknown as Record<string, unknown>),
    taskSubmissions: submissionSummary,
    certificateCount,
    finalTestCount,
  };
};

export const updateAdminUserRole = async (userId: string, role: "user" | "admin", actorId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin", status: "active" });
    if (adminCount <= 1) {
      throw new ApiError(400, "At least one active admin account must remain");
    }
  }

  user.role = role;
  await user.save();

  await recordAdminActivity({
    actorId,
    action: "user.role.updated",
    targetType: "user",
    targetId: userId,
    description: `Updated role for ${user.email} to ${role}`,
  });

  const updatedUser = await User.findById(userId).select("-password").lean();
  return updatedUser ? serializeAdminUser(updatedUser as unknown as Record<string, unknown>) : updatedUser;
};

export const updateAdminUserStatus = async (userId: string, status: "active" | "suspended", actorId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin" && status === "suspended") {
    const activeAdminCount = await User.countDocuments({ role: "admin", status: "active" });
    if (activeAdminCount <= 1) {
      throw new ApiError(400, "Cannot suspend the last active admin");
    }
  }

  user.status = status;
  await user.save();

  await recordAdminActivity({
    actorId,
    action: "user.status.updated",
    targetType: "user",
    targetId: userId,
    description: `Updated status for ${user.email} to ${status}`,
  });

  const updatedUser = await User.findById(userId).select("-password").lean();
  return updatedUser ? serializeAdminUser(updatedUser as unknown as Record<string, unknown>) : updatedUser;
};

type LeaderboardFilters = {
  page: number;
  limit: number;
  search?: string;
  period?: string;
};

export const getAdminLeaderboard = async (filters: LeaderboardFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const searchRegex = buildSearchRegex(filters.search);
  const query: Record<string, unknown> = {};

  if (searchRegex) {
    query.$or = [{ email: searchRegex }, { fullName: searchRegex }, { username: searchRegex }];
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .select("email fullName username role status score streak level lastActive")
      .sort({ score: -1, streak: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    period: filters.period || "all_time",
  };
};

export const recalculateAdminLeaderboard = async (actorId: string) => {
  const users = await User.find().select("_id score");

  await Promise.all(users.map((user) => (
    Leaderboard.findOneAndUpdate(
      { userId: user._id },
      { score: user.score },
      { upsert: true, returnDocument: "after" },
    )
  )));

  await invalidateLeaderboard();
  await recordAdminActivity({
    actorId,
    action: "leaderboard.recalculated",
    targetType: "leaderboard",
    description: "Recalculated leaderboard scores from user totals",
  });

  return getLeaderboardSnapshot();
};

export const resetAdminLeaderboard = async (resetScores: boolean, actorId: string) => {
  if (resetScores) {
    await Promise.all([
      User.updateMany({}, { $set: { score: 0, level: 1 } }),
      Leaderboard.updateMany({}, { $set: { score: 0 } }),
    ]);
  } else {
    await Leaderboard.updateMany({}, { $set: { score: 0 } });
  }

  await invalidateLeaderboard();
  await recordAdminActivity({
    actorId,
    action: "leaderboard.reset",
    targetType: "leaderboard",
    description: resetScores ? "Reset leaderboard and user scores" : "Reset leaderboard cache scores only",
  });

  return getLeaderboardSnapshot();
};

export const adjustAdminUserPoints = async (
  userId: string,
  payload: { pointsDelta?: number; absoluteScore?: number; reason?: string },
  actorId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (payload.absoluteScore !== undefined) {
    user.score = payload.absoluteScore;
  } else {
    user.score = Math.max(0, user.score + Number(payload.pointsDelta || 0));
  }

  user.level = Math.max(1, Math.floor(user.score / 100) + 1);
  await user.save();

  await Leaderboard.findOneAndUpdate(
    { userId: user._id },
    { score: user.score },
    { upsert: true, returnDocument: "after" },
  );

  await invalidateLeaderboard();
  await recordAdminActivity({
    actorId,
    action: "leaderboard.points.adjusted",
    targetType: "user",
    targetId: userId,
    description: `Adjusted leaderboard score for ${user.email}`,
    metadata: payload.reason ? { reason: payload.reason } : undefined,
  });

  const updatedUser = await User.findById(userId).select("-password").lean();
  return updatedUser ? serializeAdminUser(updatedUser as unknown as Record<string, unknown>) : updatedUser;
};

type FinalTestFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  userId?: string;
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
};

export const listAdminFinalTests = async (filters: FinalTestFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const searchRegex = buildSearchRegex(filters.search);
  const query: Record<string, unknown> = {};

  ensureObjectIdExists(filters.userId);

  if (filters.status) query.reviewStatus = filters.status;
  if (filters.userId) query.user = filters.userId;
  if (filters.scoreMin !== undefined || filters.scoreMax !== undefined) {
    query.score = {
      ...(filters.scoreMin !== undefined ? { $gte: filters.scoreMin } : {}),
      ...(filters.scoreMax !== undefined ? { $lte: filters.scoreMax } : {}),
    };
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {
      ...(filters.dateFrom ? { $gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { $lte: filters.dateTo } : {}),
    };
  }
  if (searchRegex) {
    const matchingUsers = await User.find({
      $or: [{ email: searchRegex }, { fullName: searchRegex }, { username: searchRegex }],
    }).select("_id");
    query.$or = [
      { testTitle: searchRegex },
      { recommendation: searchRegex },
      { user: { $in: matchingUsers.map((user) => user._id) } },
    ];
  }

  const [items, total] = await Promise.all([
    FinalTestSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "email fullName username score level streak")
      .populate("reviewedBy", "email fullName role")
      .lean(),
    FinalTestSubmission.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminFinalTestById = async (submissionId: string) => {
  const submission = await FinalTestSubmission.findById(submissionId)
    .populate("user", "email fullName username score level streak")
    .populate("reviewedBy", "email fullName role")
    .lean();

  if (!submission) {
    throw new ApiError(404, "Final test submission not found");
  }

  return submission;
};

export const reviewAdminFinalTest = async (
  submissionId: string,
  payload: { reviewStatus: "pending" | "approved" | "rejected" | "reviewed" | "re_evaluation_requested"; adminNotes?: string },
  actorId: string,
) => {
  const submission = await FinalTestSubmission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Final test submission not found");
  }

  submission.reviewStatus = payload.reviewStatus;
  submission.adminNotes = payload.adminNotes;
  submission.reviewedBy = new mongoose.Types.ObjectId(actorId);
  submission.reviewedAt = new Date();
  await submission.save();

  await recordAdminActivity({
    actorId,
    action: "final-test.reviewed",
    targetType: "final-test",
    targetId: submissionId,
    description: `Marked final test ${submission.testTitle} as ${payload.reviewStatus}`,
  });

  return getAdminFinalTestById(submissionId);
};

type CertificateFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  userId?: string;
};

export const listAdminCertificates = async (filters: CertificateFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const searchRegex = buildSearchRegex(filters.search);
  const query: Record<string, unknown> = {};

  ensureObjectIdExists(filters.userId);

  if (filters.status) query.status = filters.status;
  if (filters.userId) query.user = filters.userId;
  if (searchRegex) {
    const matchingUsers = await User.find({
      $or: [{ email: searchRegex }, { fullName: searchRegex }, { username: searchRegex }],
    }).select("_id");
    query.$or = [
      { certificateId: searchRegex },
      { title: searchRegex },
      { user: { $in: matchingUsers.map((user) => user._id) } },
    ];
  }

  const [items, total] = await Promise.all([
    Certificate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "email fullName username")
      .populate("generatedBy", "email fullName role")
      .populate("relatedTask", "title status")
      .populate("relatedFinalTest", "testTitle reviewStatus score")
      .lean(),
    Certificate.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminCertificateById = async (certificateId: string) => {
  const certificate = await Certificate.findById(certificateId)
    .populate("user", "email fullName username")
    .populate("generatedBy", "email fullName role")
    .populate("relatedTask", "title status")
    .populate("relatedFinalTest", "testTitle reviewStatus score")
    .lean();

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  return certificate;
};

const buildCertificateIdentifier = () => `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const generateAdminCertificate = async (
  payload: { userId: string; relatedTaskId?: string; relatedFinalTestId?: string; title?: string },
  actorId: string,
) => {
  const [user, relatedTask, relatedFinalTest] = await Promise.all([
    User.findById(payload.userId),
    payload.relatedTaskId ? Task.findById(payload.relatedTaskId) : Promise.resolve(null),
    payload.relatedFinalTestId ? FinalTestSubmission.findById(payload.relatedFinalTestId) : Promise.resolve(null),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (payload.relatedTaskId && !relatedTask) {
    throw new ApiError(404, "Related task not found");
  }

  if (payload.relatedFinalTestId && !relatedFinalTest) {
    throw new ApiError(404, "Related final test not found");
  }

  if (relatedFinalTest && !["approved", "reviewed"].includes(relatedFinalTest.reviewStatus)) {
    throw new ApiError(400, "Final test must be approved or reviewed before issuing a certificate");
  }

  const existingCertificate = await Certificate.findOne({
    user: payload.userId,
    relatedTask: payload.relatedTaskId || null,
    relatedFinalTest: payload.relatedFinalTestId || null,
  });

  if (existingCertificate) {
    throw new ApiError(409, "Certificate already exists for this user and source");
  }

  const certificateId = buildCertificateIdentifier();
  const certificate = await Certificate.create({
    user: payload.userId,
    relatedTask: payload.relatedTaskId,
    relatedFinalTest: payload.relatedFinalTestId,
    certificateId,
    issueDate: new Date(),
    status: "issued",
    generatedBy: actorId,
    fileUrl: `/certificates/${certificateId}.pdf`,
    title: payload.title || relatedTask?.title || relatedFinalTest?.testTitle || "Achievement Certificate",
    metadata: {
      generatedAt: new Date().toISOString(),
      placeholder: true,
    },
  });

  await recordAdminActivity({
    actorId,
    action: "certificate.generated",
    targetType: "certificate",
    targetId: certificate._id.toString(),
    description: `Generated certificate ${certificate.certificateId} for ${user.email}`,
  });

  return getAdminCertificateById(certificate._id.toString());
};

export const regenerateAdminCertificate = async (certificateId: string, actorId: string) => {
  const certificate = await Certificate.findById(certificateId).populate("user", "email");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  certificate.status = "issued";
  certificate.issueDate = new Date();
  certificate.generatedBy = new mongoose.Types.ObjectId(actorId);
  certificate.fileUrl = `/certificates/${certificate.certificateId}-regen.pdf`;
  certificate.metadata = {
    ...(typeof certificate.metadata === "object" && certificate.metadata ? certificate.metadata : {}),
    regeneratedAt: new Date().toISOString(),
    placeholder: true,
  };
  await certificate.save();

  await recordAdminActivity({
    actorId,
    action: "certificate.regenerated",
    targetType: "certificate",
    targetId: certificateId,
    description: `Regenerated certificate ${certificate.certificateId}`,
  });

  return getAdminCertificateById(certificateId);
};
