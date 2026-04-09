import mongoose from "mongoose";
import { z } from "zod";

const objectIdMessage = "Invalid id";

const optionalString = z.string().trim().min(1).optional();
const objectIdSchema = z.string().trim().refine((value) => mongoose.Types.ObjectId.isValid(value), objectIdMessage);
const optionalObjectIdSchema = objectIdSchema.optional();
const dateSchema = z.coerce.date();

const positiveIntSchema = z.coerce.number().int().min(1);
const nonNegativeNumberSchema = z.coerce.number().min(0);

const listQueryBaseSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

const assignedQuestionSchema = z.object({
  questionId: objectIdSchema,
  order: z.coerce.number().int().min(0).default(0),
});

const simpleTaskQuestionSchema = z.object({
  questionText: z.string().trim().min(3).max(2000),
  correctAnswer: optionalString,
  explanation: optionalString,
  points: nonNegativeNumberSchema.default(1),
});

const answerPayloadSchema = z.object({
  questionId: objectIdSchema,
  answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

const finalTestAnswerSchema = z.object({
  questionId: optionalObjectIdSchema,
  answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

const recordingUploadSchema = z.object({
  dataUrl: z.string().trim().startsWith("data:"),
  mimeType: optionalString,
  durationSeconds: nonNegativeNumberSchema.optional(),
  sizeBytes: nonNegativeNumberSchema.optional(),
});

const fileUploadSchema = z.object({
  dataUrl: z.string().trim().startsWith("data:"),
  mimeType: optionalString,
  fileName: optionalString,
  sizeBytes: nonNegativeNumberSchema.optional(),
});

const proctoringEventSchema = z.object({
  time: z.string().trim().min(1),
  message: z.string().trim().min(1).max(500),
  type: z.enum(["info", "success", "warning", "danger"]),
  source: z.enum(["camera", "voice", "screen", "system"]),
});

export const questionListQuerySchema = listQueryBaseSchema.extend({
  questionType: z.enum(["multiple_choice", "true_false", "short_answer", "fill_blank"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.string().trim().optional(),
  targetType: z.enum(["task", "daily-task", "both"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const createQuestionSchema = z.object({
  title: z.string().trim().min(3).max(160),
  questionText: z.string().trim().min(3).max(5000),
  questionType: z.enum(["multiple_choice", "true_false", "short_answer", "fill_blank"]).default("multiple_choice"),
  options: z.array(z.string().trim().min(1)).default([]),
  correctAnswer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
  explanation: optionalString,
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  category: z.string().trim().min(2).max(80),
  tags: z.array(z.string().trim().min(1)).default([]),
  points: nonNegativeNumberSchema.default(1),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  targetType: z.enum(["task", "daily-task", "both"]).default("both"),
  timeLimit: nonNegativeNumberSchema.optional(),
  priority: z.coerce.number().int().default(0),
});

export const updateQuestionSchema = createQuestionSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const questionStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export const taskListQuerySchema = listQueryBaseSchema.extend({
  category: z.string().trim().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(4000),
  category: z.string().trim().min(2).max(80),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  dueDate: dateSchema.optional(),
  rewardPoints: nonNegativeNumberSchema.default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  assignedQuestions: z.array(assignedQuestionSchema).default([]),
  simpleQuestions: z.array(simpleTaskQuestionSchema).default([]),
});

export const updateTaskSchema = createTaskSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const createDailyTaskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(4000),
  activeDate: dateSchema,
  expiryDate: dateSchema,
  rewardPoints: nonNegativeNumberSchema.default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  resetMode: z.enum(["daily", "custom", "manual"]).default("daily"),
  assignedQuestions: z.array(assignedQuestionSchema).default([]),
});

export const updateDailyTaskSchema = createDailyTaskSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const dailyTaskListQuerySchema = listQueryBaseSchema.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  activeDateFrom: z.coerce.date().optional(),
  activeDateTo: z.coerce.date().optional(),
});

const videoBaseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(4000),
  category: z.string().trim().min(2).max(80),
  level: z.string().trim().min(1).max(50),
  thumbnail: optionalString,
  videoUrl: z.string().trim().url().optional(),
  upload: fileUploadSchema.optional(),
  duration: nonNegativeNumberSchema.default(0),
  tags: z.array(z.string().trim().min(1)).default([]),
  visibility: z.enum(["public", "authenticated", "private"]).default("authenticated"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const createVideoSchema = videoBaseSchema.refine((value) => Boolean(value.videoUrl || value.upload), "videoUrl or upload is required");

export const updateVideoSchema = videoBaseSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const videoListQuerySchema = listQueryBaseSchema.extend({
  category: z.string().trim().optional(),
  level: z.string().trim().optional(),
  visibility: z.enum(["public", "authenticated", "private"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const taskSubmissionSchema = z.object({
  answers: z.array(answerPayloadSchema).min(1),
});

export const leaderboardListQuerySchema = listQueryBaseSchema.extend({
  period: z.enum(["all_time", "weekly", "monthly"]).optional(),
});

export const adjustLeaderboardPointsSchema = z.object({
  pointsDelta: z.coerce.number().int().optional(),
  absoluteScore: z.coerce.number().int().min(0).optional(),
  reason: optionalString,
}).refine((value) => value.pointsDelta !== undefined || value.absoluteScore !== undefined, "pointsDelta or absoluteScore is required");

export const resetLeaderboardSchema = z.object({
  resetScores: z.coerce.boolean().default(true),
});

export const finalTestListQuerySchema = listQueryBaseSchema.extend({
  status: z.enum(["pending", "approved", "rejected", "reviewed", "re_evaluation_requested"]).optional(),
  userId: optionalObjectIdSchema,
  scoreMin: z.coerce.number().min(0).optional(),
  scoreMax: z.coerce.number().min(0).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const reviewFinalTestSchema = z.object({
  reviewStatus: z.enum(["pending", "approved", "rejected", "reviewed", "re_evaluation_requested"]),
  adminNotes: optionalString,
});

export const submitFinalTestSchema = z.object({
  testTitle: z.string().trim().min(3).max(160),
  testCategory: z.string().trim().min(2).max(80).default("final-test"),
  answers: z.array(finalTestAnswerSchema).default([]),
  aiEvaluation: z.record(z.unknown()).optional(),
  score: nonNegativeNumberSchema.max(100),
  flags: z.array(z.string().trim().min(1).max(200)).default([]),
  recommendation: optionalString,
  responseTranscript: optionalString,
  proctoring: z.object({
    riskScore: nonNegativeNumberSchema.max(100).default(0),
    events: z.array(proctoringEventSchema).max(100).default([]),
  }).default({ riskScore: 0, events: [] }),
  recordings: z.object({
    audio: recordingUploadSchema.optional(),
    video: recordingUploadSchema.optional(),
  }).default({}),
});

export const certificateListQuerySchema = listQueryBaseSchema.extend({
  status: z.enum(["pending", "issued", "failed"]).optional(),
  userId: optionalObjectIdSchema,
});

export const generateCertificateSchema = z.object({
  userId: objectIdSchema,
  relatedTaskId: optionalObjectIdSchema,
  relatedFinalTestId: optionalObjectIdSchema,
  title: optionalString,
});

export const adminUsersListQuerySchema = listQueryBaseSchema.extend({
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  dept: z.string().trim().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export const createAdminInviteSchema = z.object({
  email: z.string().trim().email(),
  message: z.string().trim().max(400).optional(),
});

export const objectIdParamSchema = z.object({
  id: objectIdSchema,
});

export const userIdParamSchema = z.object({
  userId: objectIdSchema,
});

export const duplicateQuestionParamSchema = z.object({
  id: objectIdSchema,
});

export const adminDashboardQuerySchema = z.object({
  recentActivityLimit: positiveIntSchema.max(25).default(8),
});
