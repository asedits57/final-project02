import Question from "../models/Question";
import Task from "../models/Task";
import TaskSubmission from "../models/TaskSubmission";
import ApiError from "../utils/ApiError";
import { buildSearchRegex, getPagination } from "../utils/query";
import { answersMatch } from "../utils/scoring";
import { updateUserProgress } from "./userService";
import { recordAdminActivity } from "./adminActivityService";

type TaskFilters = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  difficulty?: string;
  status?: string;
};

type TaskPayload = {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  dueDate?: Date;
  rewardPoints?: number;
  status?: string;
  assignedQuestions?: Array<{ questionId: string; order: number }>;
  simpleQuestions?: Array<{
    questionText: string;
    correctAnswer?: string;
    explanation?: string;
    points?: number;
  }>;
};

type SubmissionPayload = {
  answers: Array<{ questionId: string; answer: string | number | boolean | string[] }>;
};

const AUTO_TASK_QUESTION_BANK_LIMIT = 6;

const buildTaskQuery = ({ search, category, difficulty, status }: Omit<TaskFilters, "page" | "limit">) => {
  const searchRegex = buildSearchRegex(search);
  const query: Record<string, unknown> = {};

  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (status) query.status = status;
  if (searchRegex) {
    query.$or = [{ title: searchRegex }, { description: searchRegex }, { category: searchRegex }];
  }

  return query;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const populateTaskDocument = async (taskId: string) => {
  const task = await Task.findById(taskId)
    .populate("createdBy", "email fullName role")
    .populate("updatedBy", "email fullName role")
    .populate("assignedQuestions.questionId");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const payload = task.toObject();
  return {
    ...payload,
    assignedQuestions: [...task.assignedQuestions].sort((left, right) => left.order - right.order),
    questionCount: task.assignedQuestions.length,
  };
};

const listAutoAssignedQuestionBankQuestions = async (
  taskPayload: Pick<TaskPayload, "category" | "difficulty">,
  excludedQuestionIds: string[] = [],
) => {
  const normalizedCategory = String(taskPayload.category || "").trim();
  if (!normalizedCategory) {
    return [];
  }

  const normalizedDifficulty = String(taskPayload.difficulty || "").trim();
  const uniqueExcludedQuestionIds = Array.from(new Set(excludedQuestionIds.filter(Boolean)));
  const baseQuery: Record<string, unknown> = {
    status: "published",
    targetType: { $in: ["task", "both"] },
    category: new RegExp(`^${escapeRegex(normalizedCategory)}$`, "i"),
    ...(uniqueExcludedQuestionIds.length ? { _id: { $nin: uniqueExcludedQuestionIds } } : {}),
  };

  const exactMatches = await Question.find(
    normalizedDifficulty ? { ...baseQuery, difficulty: normalizedDifficulty } : baseQuery,
  )
    .sort({ priority: -1, createdAt: -1 })
    .limit(AUTO_TASK_QUESTION_BANK_LIMIT)
    .select("_id")
    .lean();

  if (!normalizedDifficulty || exactMatches.length >= AUTO_TASK_QUESTION_BANK_LIMIT) {
    return exactMatches;
  }

  const fallbackMatches = await Question.find({
    ...baseQuery,
    difficulty: { $ne: normalizedDifficulty },
    _id: {
      $nin: [...uniqueExcludedQuestionIds, ...exactMatches.map((question) => question._id.toString())],
    },
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(AUTO_TASK_QUESTION_BANK_LIMIT - exactMatches.length)
    .select("_id")
    .lean();

  return [...exactMatches, ...fallbackMatches];
};

const appendAssignedQuestions = (
  assignedQuestions: Array<{ questionId: string; order: number }>,
  questionIds: string[],
) => [
  ...assignedQuestions,
  ...questionIds.map((questionId, index) => ({
    questionId,
    order: assignedQuestions.length + index,
  })),
];

const buildInlineQuestionTitle = (taskTitle: string | undefined, questionText: string, index: number) => {
  const taskLabel = String(taskTitle || "Task").trim();
  const compactText = questionText.trim().replace(/\s+/g, " ");
  const preview = compactText.slice(0, 60);
  return `${taskLabel} - Q${index + 1}: ${preview}`;
};

const createInlineTaskQuestions = async (
  taskId: string,
  taskPayload: TaskPayload,
  questions: NonNullable<TaskPayload["simpleQuestions"]>,
  userId: string,
) => {
  if (!questions.length) {
    return [];
  }

  const category = String(taskPayload.category || "general").trim();
  const difficulty = String(taskPayload.difficulty || "medium").trim() as "easy" | "medium" | "hard";
  const status = String(taskPayload.status || "draft").trim() as "draft" | "published" | "archived";
  const taskTag = `task-inline:${taskId}`;

  return Question.insertMany(
    questions.map((question, index) => ({
      title: buildInlineQuestionTitle(taskPayload.title, question.questionText, index),
      questionText: question.questionText.trim(),
      text: question.questionText.trim(),
      questionType: "short_answer",
      correctAnswer: question.correctAnswer?.trim() || undefined,
      explanation: question.explanation?.trim() || undefined,
      difficulty,
      category,
      module: category,
      tags: [taskTag],
      points: Number(question.points || 1),
      status,
      targetType: "task",
      createdBy: userId,
      updatedBy: userId,
    })),
  );
};

const sanitizeTaskPayload = (payload: TaskPayload) => {
  const nextPayload: TaskPayload = { ...payload };

  if (nextPayload.assignedQuestions) {
    nextPayload.assignedQuestions = [...nextPayload.assignedQuestions].sort((left, right) => left.order - right.order);
  }

  if (nextPayload.simpleQuestions) {
    nextPayload.simpleQuestions = nextPayload.simpleQuestions
      .map((question) => ({
        ...question,
        questionText: question.questionText.trim(),
        correctAnswer: question.correctAnswer?.trim() || undefined,
        explanation: question.explanation?.trim() || undefined,
      }))
      .filter((question) => question.questionText);
  }

  return nextPayload;
};

export const listAdminTasks = async (filters: TaskFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const query = buildTaskQuery(filters);

  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(query),
  ]);

  return {
    items: tasks.map((task) => ({
      ...task,
      questionCount: Array.isArray(task.assignedQuestions) ? task.assignedQuestions.length : 0,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminTaskById = async (taskId: string) => populateTaskDocument(taskId);

export const backfillTaskQuestionBankAssignments = async () => {
  const tasks = await Task.find({
    $or: [
      { assignedQuestions: { $exists: false } },
      { "assignedQuestions.0": { $exists: false } },
    ],
  })
    .select("_id category difficulty")
    .lean();

  let updatedTasks = 0;

  for (const task of tasks) {
    const autoAssignedQuestions = await listAutoAssignedQuestionBankQuestions({
      category: String(task.category || "").trim(),
      difficulty: String(task.difficulty || "").trim(),
    });

    if (!autoAssignedQuestions.length) {
      continue;
    }

    const result = await Task.updateOne(
      {
        _id: task._id,
        $or: [
          { assignedQuestions: { $exists: false } },
          { "assignedQuestions.0": { $exists: false } },
        ],
      },
      {
        $set: {
          assignedQuestions: appendAssignedQuestions([], autoAssignedQuestions.map((question) => question._id.toString())),
        },
      },
    );

    if (result.modifiedCount > 0) {
      updatedTasks += 1;
    }
  }

  return updatedTasks;
};

export const createAdminTask = async (payload: TaskPayload, userId: string) => {
  const normalizedPayload = sanitizeTaskPayload(payload);
  const { simpleQuestions = [], ...taskPayload } = normalizedPayload;
  const explicitAssignedQuestions = taskPayload.assignedQuestions || [];
  await assertQuestionIdsExist(explicitAssignedQuestions);

  const autoAssignedQuestions = await listAutoAssignedQuestionBankQuestions(
    taskPayload,
    explicitAssignedQuestions.map((item) => item.questionId),
  );

  const task = await Task.create({
    ...taskPayload,
    assignedQuestions: appendAssignedQuestions(
      explicitAssignedQuestions,
      autoAssignedQuestions.map((question) => question._id.toString()),
    ),
    createdBy: userId,
    updatedBy: userId,
  });

  if (simpleQuestions.length > 0) {
    const createdQuestions = await createInlineTaskQuestions(task._id.toString(), taskPayload, simpleQuestions, userId);
    const existingAssignedQuestions = task.assignedQuestions.map((item) => item.questionId.toString());

    task.set(
      "assignedQuestions",
      appendAssignedQuestions(existingAssignedQuestions.map((questionId, index) => ({ questionId, order: index })), createdQuestions.map((question) => question._id.toString())),
    );
    await task.save();
  }

  await recordAdminActivity({
    actorId: userId,
    action: "task.created",
    targetType: "task",
    targetId: task._id.toString(),
    description: `Created task ${task.title}`,
  });

  return populateTaskDocument(task._id.toString());
};

export const updateAdminTask = async (taskId: string, payload: TaskPayload, userId: string) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const normalizedPayload = sanitizeTaskPayload(payload);
  const { simpleQuestions = [], ...taskPayload } = normalizedPayload;
  const currentAssignedQuestions = task.assignedQuestions.map((item) => ({
    questionId: item.questionId.toString(),
    order: item.order,
  }));
  const explicitAssignedQuestions = taskPayload.assignedQuestions || currentAssignedQuestions;

  await assertQuestionIdsExist(explicitAssignedQuestions);

  const autoAssignedQuestions = await listAutoAssignedQuestionBankQuestions(
    {
      category: taskPayload.category ?? task.category,
      difficulty: taskPayload.difficulty ?? task.difficulty,
    },
    explicitAssignedQuestions.map((item) => item.questionId),
  );

  const nextAssignedQuestions = appendAssignedQuestions(
    explicitAssignedQuestions,
    autoAssignedQuestions.map((question) => question._id.toString()),
  );
  taskPayload.assignedQuestions = nextAssignedQuestions;

  if (simpleQuestions.length > 0) {
    const inlineQuestionTaskPayload: TaskPayload = {
      title: taskPayload.title ?? task.title,
      category: taskPayload.category ?? task.category,
      difficulty: taskPayload.difficulty ?? task.difficulty,
      status: taskPayload.status ?? task.status,
    };
    const createdQuestions = await createInlineTaskQuestions(taskId, inlineQuestionTaskPayload, simpleQuestions, userId);
    taskPayload.assignedQuestions = appendAssignedQuestions(
      nextAssignedQuestions,
      createdQuestions.map((question) => question._id.toString()),
    );
  }

  Object.assign(task, taskPayload, { updatedBy: userId });
  await task.save();

  await recordAdminActivity({
    actorId: userId,
    action: "task.updated",
    targetType: "task",
    targetId: taskId,
    description: `Updated task ${task.title}`,
  });

  return populateTaskDocument(taskId);
};

export const deleteAdminTask = async (taskId: string, userId: string) => {
  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await TaskSubmission.deleteMany({ task: taskId });
  await Question.deleteMany({ tags: `task-inline:${taskId}` });
  await recordAdminActivity({
    actorId: userId,
    action: "task.deleted",
    targetType: "task",
    targetId: taskId,
    description: `Deleted task ${task.title}`,
  });
};

export const publishAdminTask = async (taskId: string, userId: string) => {
  return updateAdminTask(taskId, { status: "published" }, userId);
};

export const unpublishAdminTask = async (taskId: string, userId: string) => {
  return updateAdminTask(taskId, { status: "draft" }, userId);
};

export const listUserTasks = async (userId: string) => {
  const [tasks, submissions] = await Promise.all([
    Task.find({ status: "published" }).sort({ dueDate: 1, createdAt: -1 }).lean(),
    TaskSubmission.find({ user: userId, targetType: "task" }).select("task score earnedPoints submittedAt").lean(),
  ]);

  const submissionMap = new Map(submissions.map((submission) => [submission.task?.toString(), submission]));

  return tasks.map((task) => ({
    ...task,
    questionCount: Array.isArray(task.assignedQuestions) ? task.assignedQuestions.length : 0,
    submission: submissionMap.get(task._id.toString()) || null,
  }));
};

export const getUserTaskById = async (taskId: string, userId: string) => {
  const task = await Task.findOne({ _id: taskId, status: "published" }).populate("assignedQuestions.questionId");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const submission = await TaskSubmission.findOne({ user: userId, task: taskId, targetType: "task" }).lean();
  const payload = task.toObject();
  const assignedQuestions = [...task.assignedQuestions]
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
    questionCount: assignedQuestions.length,
    submission,
  };
};

export const submitUserTask = async (taskId: string, userId: string, payload: SubmissionPayload) => {
  const existingSubmission = await TaskSubmission.findOne({ user: userId, task: taskId, targetType: "task" });
  if (existingSubmission) {
    throw new ApiError(409, "Task already submitted");
  }

  const task = await Task.findOne({ _id: taskId, status: "published" }).populate("assignedQuestions.questionId");
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const assignedQuestions = [...task.assignedQuestions].sort((left, right) => left.order - right.order);
  const answerMap = new Map(payload.answers.map((answer) => [answer.questionId, answer.answer]));

  let score = 0;
  let maxScore = 0;

  const answers = assignedQuestions.map((item) => {
    const question = item.questionId as unknown as Record<string, unknown>;
    const questionId = String(question._id);
    const expectedAnswer = question.correctAnswer;
    const receivedAnswer = answerMap.get(questionId);
    const points = Number(question.points || 1);
    const isGradable = expectedAnswer !== undefined && expectedAnswer !== null && !(typeof expectedAnswer === "string" && expectedAnswer.trim() === "");
    const isCorrect = isGradable && receivedAnswer !== undefined && answersMatch(expectedAnswer, receivedAnswer);

    if (isGradable) {
      maxScore += points;
    }
    if (isCorrect) {
      score += points;
    }

    return {
      questionId,
      answer: receivedAnswer ?? "",
      isCorrect: isGradable ? isCorrect : undefined,
    };
  });

  const earnedPoints = score + Number(task.rewardPoints || 0);
  const submission = await TaskSubmission.create({
    user: userId,
    targetType: "task",
    task: taskId,
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
