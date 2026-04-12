import Question from "../models/Question";
import ApiError from "../utils/ApiError";
import { logBestEffortFailure } from "../utils/bestEffort";
import { getPagination, buildSearchRegex } from "../utils/query";
import { recordAdminActivity } from "./adminActivityService";
import { safeDel } from "../config/redis";

const PUBLIC_QUESTION_CACHE_KEY = "public_questions_payload_v2";

type QuestionFilters = {
  page: number;
  limit: number;
  search?: string;
  questionType?: string;
  difficulty?: string;
  category?: string;
  targetType?: string;
  status?: string;
};

type QuestionPayload = {
  title?: string;
  questionText?: string;
  questionType?: string;
  options?: string[];
  correctAnswer?: unknown;
  explanation?: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
  points?: number;
  status?: string;
  targetType?: string;
  timeLimit?: number;
  priority?: number;
};

const buildQuestionQuery = ({
  search,
  questionType,
  difficulty,
  category,
  targetType,
  status,
}: Omit<QuestionFilters, "page" | "limit">) => {
  const searchRegex = buildSearchRegex(search);
  const query: Record<string, unknown> = {};

  if (questionType) query.questionType = questionType;
  if (difficulty) query.difficulty = difficulty;
  if (category) query.category = category;
  if (targetType) query.targetType = targetType;
  if (status) query.status = status;
  if (searchRegex) {
    query.$or = [
      { title: searchRegex },
      { questionText: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
    ];
  }

  return query;
};

export const listAdminQuestions = async (filters: QuestionFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const query = buildQuestionQuery(filters);

  const [items, total] = await Promise.all([
    Question.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "email fullName role")
      .populate("updatedBy", "email fullName role")
      .lean(),
    Question.countDocuments(query),
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

export const getAdminQuestionById = async (questionId: string) => {
  const question = await Question.findById(questionId)
    .populate("createdBy", "email fullName role")
    .populate("updatedBy", "email fullName role")
    .lean();

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return question;
};

export const createAdminQuestion = async (payload: QuestionPayload, userId: string) => {
  const question = await Question.create({
    ...payload,
    text: payload.questionText,
    module: payload.category,
    createdBy: userId,
    updatedBy: userId,
  });

  await safeDel(PUBLIC_QUESTION_CACHE_KEY);
  await recordAdminActivity({
    actorId: userId,
    action: "question.created",
    targetType: "question",
    targetId: question._id.toString(),
    description: `Created question ${question.title || question._id.toString()}`,
  });
  try {
    const { emitQuestionRealtimeEvent } = await import("./socketService");
    emitQuestionRealtimeEvent("created", { id: question._id.toString() });
  } catch (error) {
    logBestEffortFailure("Failed to emit question created realtime event", error);
  }

  return getAdminQuestionById(question._id.toString());
};

export const updateAdminQuestion = async (questionId: string, payload: QuestionPayload, userId: string) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  Object.assign(question, payload, {
    updatedBy: userId,
  });

  if (payload.questionText !== undefined) {
    question.text = payload.questionText;
  }

  if (payload.category !== undefined) {
    question.module = payload.category;
  }

  await question.save();

  await safeDel(PUBLIC_QUESTION_CACHE_KEY);
  await recordAdminActivity({
    actorId: userId,
    action: "question.updated",
    targetType: "question",
    targetId: questionId,
    description: `Updated question ${question.title || questionId}`,
  });
  try {
    const { emitQuestionRealtimeEvent } = await import("./socketService");
    emitQuestionRealtimeEvent("updated", { id: questionId });
  } catch (error) {
    logBestEffortFailure("Failed to emit question updated realtime event", error);
  }

  return getAdminQuestionById(questionId);
};

export const deleteAdminQuestion = async (questionId: string, userId: string) => {
  const deletedQuestion = await Question.findByIdAndDelete(questionId);

  if (!deletedQuestion) {
    throw new ApiError(404, "Question not found");
  }

  await safeDel(PUBLIC_QUESTION_CACHE_KEY);
  await recordAdminActivity({
    actorId: userId,
    action: "question.deleted",
    targetType: "question",
    targetId: questionId,
    description: `Deleted question ${deletedQuestion.title || deletedQuestion._id.toString()}`,
  });
  try {
    const { emitQuestionRealtimeEvent } = await import("./socketService");
    emitQuestionRealtimeEvent("deleted", { id: questionId });
  } catch (error) {
    logBestEffortFailure("Failed to emit question deleted realtime event", error);
  }
};

export const duplicateAdminQuestion = async (questionId: string, userId: string) => {
  const sourceQuestion = await Question.findById(questionId).lean();

  if (!sourceQuestion) {
    throw new ApiError(404, "Question not found");
  }

  const { _id, createdAt, updatedAt, ...rest } = sourceQuestion;
  void _id;
  void createdAt;
  void updatedAt;
  const duplicatedQuestion = await Question.create({
    ...rest,
    title: `${sourceQuestion.title || "Question"} (Copy)`,
    status: "draft",
    createdBy: userId,
    updatedBy: userId,
  });

  await safeDel(PUBLIC_QUESTION_CACHE_KEY);
  await recordAdminActivity({
    actorId: userId,
    action: "question.duplicated",
    targetType: "question",
    targetId: duplicatedQuestion._id.toString(),
    description: `Duplicated question ${sourceQuestion.title || questionId}`,
  });
  try {
    const { emitQuestionRealtimeEvent } = await import("./socketService");
    emitQuestionRealtimeEvent("duplicated", { id: duplicatedQuestion._id.toString() });
  } catch (error) {
    logBestEffortFailure("Failed to emit question duplicated realtime event", error);
  }

  return getAdminQuestionById(duplicatedQuestion._id.toString());
};

export const updateAdminQuestionStatus = async (questionId: string, status: string, userId: string) => {
  return updateAdminQuestion(questionId, { status }, userId);
};
