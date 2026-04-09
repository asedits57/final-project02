import DailyTask from "../models/DailyTask";
import Question from "../models/Question";
import TaskSubmission from "../models/TaskSubmission";
import ApiError from "../utils/ApiError";
import { buildSearchRegex, getPagination } from "../utils/query";
import { answersMatch } from "../utils/scoring";
import { updateUserProgress } from "./userService";
import { recordAdminActivity } from "./adminActivityService";

type DailyTaskFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  activeDateFrom?: Date;
  activeDateTo?: Date;
};

type DailyTaskPayload = {
  title?: string;
  description?: string;
  activeDate?: Date;
  expiryDate?: Date;
  rewardPoints?: number;
  status?: string;
  resetMode?: string;
  assignedQuestions?: Array<{ questionId: string; order: number }>;
};

type SubmissionPayload = {
  answers: Array<{ questionId: string; answer: string | number | boolean | string[] }>;
};

const buildDailyTaskQuery = ({ search, status, activeDateFrom, activeDateTo }: Omit<DailyTaskFilters, "page" | "limit">) => {
  const searchRegex = buildSearchRegex(search);
  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (activeDateFrom || activeDateTo) {
    query.activeDate = {
      ...(activeDateFrom ? { $gte: activeDateFrom } : {}),
      ...(activeDateTo ? { $lte: activeDateTo } : {}),
    };
  }
  if (searchRegex) {
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  return query;
};

const assertQuestionIdsExist = async (assignedQuestions: Array<{ questionId: string; order: number }>) => {
  const questionIds = assignedQuestions.map((item) => item.questionId);
  if (questionIds.length === 0) {
    return;
  }

  const foundQuestions = await Question.countDocuments({ _id: { $in: questionIds } });
  if (foundQuestions !== questionIds.length) {
    throw new ApiError(400, "One or more assigned questions do not exist");
  }
};

const populateDailyTaskDocument = async (dailyTaskId: string) => {
  const dailyTask = await DailyTask.findById(dailyTaskId)
    .populate("createdBy", "email fullName role")
    .populate("updatedBy", "email fullName role")
    .populate("assignedQuestions.questionId");

  if (!dailyTask) {
    throw new ApiError(404, "Daily task not found");
  }

  const payload = dailyTask.toObject();
  return {
    ...payload,
    assignedQuestions: [...dailyTask.assignedQuestions].sort((left, right) => left.order - right.order),
  };
};

const sanitizeDailyTaskPayload = (payload: DailyTaskPayload) => {
  if (!payload.assignedQuestions) {
    return payload;
  }

  return {
    ...payload,
    assignedQuestions: [...payload.assignedQuestions].sort((left, right) => left.order - right.order),
  };
};

export const listAdminDailyTasks = async (filters: DailyTaskFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const query = buildDailyTaskQuery(filters);

  const [items, total] = await Promise.all([
    DailyTask.find(query).sort({ activeDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    DailyTask.countDocuments(query),
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

export const getAdminDailyTaskById = async (dailyTaskId: string) => populateDailyTaskDocument(dailyTaskId);

export const createAdminDailyTask = async (payload: DailyTaskPayload, userId: string) => {
  const normalizedPayload = sanitizeDailyTaskPayload(payload);
  await assertQuestionIdsExist(normalizedPayload.assignedQuestions || []);

  if (normalizedPayload.activeDate && normalizedPayload.expiryDate && normalizedPayload.activeDate > normalizedPayload.expiryDate) {
    throw new ApiError(400, "activeDate cannot be later than expiryDate");
  }

  const dailyTask = await DailyTask.create({
    ...normalizedPayload,
    createdBy: userId,
    updatedBy: userId,
  });

  await recordAdminActivity({
    actorId: userId,
    action: "daily-task.created",
    targetType: "daily-task",
    targetId: dailyTask._id.toString(),
    description: `Created daily task ${dailyTask.title}`,
  });

  return populateDailyTaskDocument(dailyTask._id.toString());
};

export const updateAdminDailyTask = async (dailyTaskId: string, payload: DailyTaskPayload, userId: string) => {
  const dailyTask = await DailyTask.findById(dailyTaskId);

  if (!dailyTask) {
    throw new ApiError(404, "Daily task not found");
  }

  const normalizedPayload = sanitizeDailyTaskPayload(payload);
  await assertQuestionIdsExist(normalizedPayload.assignedQuestions || dailyTask.assignedQuestions.map((item) => ({
    questionId: item.questionId.toString(),
    order: item.order,
  })));

  const nextActiveDate = normalizedPayload.activeDate || dailyTask.activeDate;
  const nextExpiryDate = normalizedPayload.expiryDate || dailyTask.expiryDate;
  if (nextActiveDate > nextExpiryDate) {
    throw new ApiError(400, "activeDate cannot be later than expiryDate");
  }

  Object.assign(dailyTask, normalizedPayload, { updatedBy: userId });
  await dailyTask.save();

  await recordAdminActivity({
    actorId: userId,
    action: "daily-task.updated",
    targetType: "daily-task",
    targetId: dailyTaskId,
    description: `Updated daily task ${dailyTask.title}`,
  });

  return populateDailyTaskDocument(dailyTaskId);
};

export const deleteAdminDailyTask = async (dailyTaskId: string, userId: string) => {
  const dailyTask = await DailyTask.findByIdAndDelete(dailyTaskId);

  if (!dailyTask) {
    throw new ApiError(404, "Daily task not found");
  }

  await TaskSubmission.deleteMany({ dailyTask: dailyTaskId });
  await recordAdminActivity({
    actorId: userId,
    action: "daily-task.deleted",
    targetType: "daily-task",
    targetId: dailyTaskId,
    description: `Deleted daily task ${dailyTask.title}`,
  });
};

export const publishAdminDailyTask = async (dailyTaskId: string, userId: string) => {
  return updateAdminDailyTask(dailyTaskId, { status: "published" }, userId);
};

export const unpublishAdminDailyTask = async (dailyTaskId: string, userId: string) => {
  return updateAdminDailyTask(dailyTaskId, { status: "draft" }, userId);
};

export const getActiveDailyTaskForUser = async (userId: string) => {
  const now = new Date();
  const dailyTask = await DailyTask.findOne({
    status: "published",
    activeDate: { $lte: now },
    expiryDate: { $gte: now },
  }).sort({ activeDate: -1 }).populate("assignedQuestions.questionId");

  if (!dailyTask) {
    return null;
  }

  const submission = await TaskSubmission.findOne({
    user: userId,
    dailyTask: dailyTask._id,
    targetType: "daily-task",
  }).lean();

  const payload = dailyTask.toObject();
  const assignedQuestions = [...dailyTask.assignedQuestions]
    .sort((left, right) => left.order - right.order)
    .map((item) => {
      const question = item.questionId as unknown as Record<string, unknown>;
      return {
        order: item.order,
        question: {
          _id: question._id,
          title: question.title,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          difficulty: question.difficulty,
          category: question.category,
          points: question.points,
          explanation: question.explanation,
        },
      };
    });

  return {
    ...payload,
    assignedQuestions,
    submission,
  };
};

export const getDailyTaskForUserById = async (dailyTaskId: string, userId: string) => {
  const dailyTask = await DailyTask.findOne({ _id: dailyTaskId, status: "published" }).populate("assignedQuestions.questionId");

  if (!dailyTask) {
    throw new ApiError(404, "Daily task not found");
  }

  const submission = await TaskSubmission.findOne({ user: userId, dailyTask: dailyTaskId, targetType: "daily-task" }).lean();
  const payload = dailyTask.toObject();
  const assignedQuestions = [...dailyTask.assignedQuestions]
    .sort((left, right) => left.order - right.order)
    .map((item) => {
      const question = item.questionId as unknown as Record<string, unknown>;
      return {
        order: item.order,
        question: {
          _id: question._id,
          title: question.title,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          difficulty: question.difficulty,
          category: question.category,
          points: question.points,
          explanation: question.explanation,
        },
      };
    });

  return {
    ...payload,
    assignedQuestions,
    submission,
  };
};

export const submitDailyTaskForUser = async (dailyTaskId: string, userId: string, payload: SubmissionPayload) => {
  const existingSubmission = await TaskSubmission.findOne({ user: userId, dailyTask: dailyTaskId, targetType: "daily-task" });
  if (existingSubmission) {
    throw new ApiError(409, "Daily task already submitted");
  }

  const dailyTask = await DailyTask.findOne({ _id: dailyTaskId, status: "published" }).populate("assignedQuestions.questionId");
  if (!dailyTask) {
    throw new ApiError(404, "Daily task not found");
  }

  const assignedQuestions = [...dailyTask.assignedQuestions].sort((left, right) => left.order - right.order);
  const answerMap = new Map(payload.answers.map((answer) => [answer.questionId, answer.answer]));

  let score = 0;
  let maxScore = 0;

  const answers = assignedQuestions.map((item) => {
    const question = item.questionId as unknown as Record<string, unknown>;
    const questionId = String(question._id);
    const expectedAnswer = question.correctAnswer;
    const receivedAnswer = answerMap.get(questionId);
    const points = Number(question.points || 1);
    const isCorrect = receivedAnswer !== undefined && answersMatch(expectedAnswer, receivedAnswer);

    maxScore += points;
    if (isCorrect) {
      score += points;
    }

    return {
      questionId,
      answer: receivedAnswer ?? "",
      isCorrect,
    };
  });

  const earnedPoints = score + Number(dailyTask.rewardPoints || 0);
  const submission = await TaskSubmission.create({
    user: userId,
    targetType: "daily-task",
    dailyTask: dailyTaskId,
    answers,
    score,
    maxScore,
    earnedPoints,
  });

  const updatedUser = await updateUserProgress(userId, earnedPoints);

  return {
    submission,
    score,
    maxScore,
    earnedPoints,
    user: {
      id: updatedUser._id.toString(),
      score: updatedUser.score,
      level: updatedUser.level,
      streak: updatedUser.streak,
    },
  };
};
