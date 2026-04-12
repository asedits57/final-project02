import FinalTestConfig from "../models/FinalTestConfig";
import FinalTestSubmission from "../models/FinalTestSubmission";
import Question from "../models/Question";
import ApiError from "../utils/ApiError";
import { logBestEffortFailure } from "../utils/bestEffort";
import { recordAdminActivity } from "./adminActivityService";

type FinalTestAssignedQuestion = {
  questionId: string;
  order: number;
};

type FinalTestConfigPayload = {
  title: string;
  enabled: boolean;
  status: "draft" | "published" | "archived";
  questionCount: number;
  assignedQuestions: FinalTestAssignedQuestion[];
  filters: {
    categories: string[];
    difficulties: Array<"easy" | "medium" | "hard">;
    questionTypes: Array<"multiple_choice" | "true_false" | "short_answer" | "fill_blank">;
    tags: string[];
  };
  timeLimitMinutes: number;
  passingScore: number;
  instructions: string;
  allowRetake: boolean;
};

type ResolvedQuestion = {
  _id: string;
  title: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer" | "fill_blank";
  options: string[];
  correctAnswer?: unknown;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  points: number;
};

const FINAL_TEST_TARGET_TYPES = ["final-test", "both", "all"] as const;

const getSortedAssignedQuestions = (assignedQuestions: FinalTestAssignedQuestion[] = []) => (
  [...assignedQuestions].sort((left, right) => left.order - right.order)
);

const mapQuestionForResponse = (
  question: Record<string, unknown>,
  includeCorrectAnswer = false,
): ResolvedQuestion => ({
  _id: String(question._id),
  title: String(question.title || "Untitled question"),
  questionText: String(question.questionText || ""),
  questionType: question.questionType as ResolvedQuestion["questionType"],
  options: Array.isArray(question.options) ? question.options.map((item) => String(item)) : [],
  ...(includeCorrectAnswer ? { correctAnswer: question.correctAnswer } : {}),
  ...(typeof question.explanation === "string" && question.explanation.trim()
    ? { explanation: question.explanation }
    : {}),
  difficulty: question.difficulty as ResolvedQuestion["difficulty"],
  category: String(question.category || "general"),
  tags: Array.isArray(question.tags) ? question.tags.map((item) => String(item)) : [],
  points: Math.max(0, Number(question.points || 0)),
});

const buildQuestionFilters = (filters: FinalTestConfigPayload["filters"]) => {
  const query: Record<string, unknown> = {
    status: "published",
    targetType: { $in: FINAL_TEST_TARGET_TYPES },
  };

  if (filters.categories.length > 0) {
    query.category = { $in: filters.categories };
  }
  if (filters.difficulties.length > 0) {
    query.difficulty = { $in: filters.difficulties };
  }
  if (filters.questionTypes.length > 0) {
    query.questionType = { $in: filters.questionTypes };
  }
  if (filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  return query;
};

const getLatestConfigQuery = () => FinalTestConfig.findOne().sort({ updatedAt: -1 });

const assertAssignedQuestionsExist = async (assignedQuestions: FinalTestAssignedQuestion[]) => {
  const questionIds = assignedQuestions.map((item) => item.questionId);
  if (questionIds.length === 0) {
    return;
  }

  const foundCount = await Question.countDocuments({
    _id: { $in: questionIds },
    status: "published",
    targetType: { $in: FINAL_TEST_TARGET_TYPES },
  });

  if (foundCount !== questionIds.length) {
    throw new ApiError(400, "One or more assigned final-test questions are missing or not published for final tests");
  }
};

const ensureFinalTestConfig = async (actorId?: string) => {
  const existingConfig = await getLatestConfigQuery();
  if (existingConfig) {
    return existingConfig;
  }

  return FinalTestConfig.create({
    title: "Platform Final Test",
    enabled: false,
    status: "draft",
    questionCount: 10,
    assignedQuestions: [],
    filters: {
      categories: [],
      difficulties: [],
      questionTypes: [],
      tags: [],
    },
    timeLimitMinutes: 30,
    passingScore: 60,
    instructions: "Answer all questions carefully before submitting the final test.",
    allowRetake: true,
    createdBy: actorId,
    updatedBy: actorId,
  });
};

export const resolveFinalTestQuestions = async (
  config: {
    assignedQuestions?: FinalTestAssignedQuestion[];
    questionCount: number;
    filters: FinalTestConfigPayload["filters"];
  },
  includeCorrectAnswer = false,
) => {
  const assignedQuestions = getSortedAssignedQuestions(config.assignedQuestions || []);
  const assignedQuestionIds = assignedQuestions.map((item) => item.questionId);

  const assignedDocuments = assignedQuestionIds.length > 0
    ? await Question.find({
      _id: { $in: assignedQuestionIds },
      status: "published",
      targetType: { $in: FINAL_TEST_TARGET_TYPES },
    }).lean()
    : [];

  const assignedQuestionMap = new Map(
    assignedDocuments.map((question) => [question._id.toString(), question]),
  );

  const resolvedQuestions = assignedQuestions
    .map((assignedQuestion) => assignedQuestionMap.get(assignedQuestion.questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question))
    .map((question) => mapQuestionForResponse(question as unknown as Record<string, unknown>, includeCorrectAnswer));

  const remainingCount = Math.max(0, config.questionCount - resolvedQuestions.length);
  if (remainingCount > 0) {
    const additionalQuestions = await Question.find({
      ...buildQuestionFilters(config.filters),
      ...(assignedQuestionIds.length > 0 ? { _id: { $nin: assignedQuestionIds } } : {}),
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(remainingCount)
      .lean();

    resolvedQuestions.push(
      ...additionalQuestions.map((question) => mapQuestionForResponse(question as unknown as Record<string, unknown>, includeCorrectAnswer)),
    );
  }

  return {
    questions: resolvedQuestions.slice(0, config.questionCount),
    totalMarks: resolvedQuestions.slice(0, config.questionCount).reduce((total, question) => total + Math.max(1, Number(question.points || 1)), 0),
  };
};

const serializeAdminConfig = async (config: Awaited<ReturnType<typeof ensureFinalTestConfig>>) => {
  const resolved = await resolveFinalTestQuestions({
    assignedQuestions: getSortedAssignedQuestions(
      (config.assignedQuestions || []).map((item) => ({
        questionId: item.questionId.toString(),
        order: item.order,
      })),
    ),
    questionCount: config.questionCount,
    filters: config.filters,
  });

  const payload = config.toObject();

  return {
    ...payload,
    assignedQuestions: getSortedAssignedQuestions(
      (payload.assignedQuestions || []).map((item: { questionId: { toString(): string }; order: number }) => ({
        questionId: item.questionId.toString(),
        order: item.order,
      })),
    ),
    previewQuestions: resolved.questions,
    totalMarks: resolved.totalMarks,
    resolvedQuestionCount: resolved.questions.length,
  };
};

export const getAdminFinalTestConfig = async () => {
  const config = await ensureFinalTestConfig();
  return serializeAdminConfig(config);
};

export const upsertAdminFinalTestConfig = async (payload: FinalTestConfigPayload, actorId: string) => {
  const config = await ensureFinalTestConfig(actorId);
  await assertAssignedQuestionsExist(payload.assignedQuestions);

  Object.assign(config, {
    ...payload,
    assignedQuestions: getSortedAssignedQuestions(payload.assignedQuestions),
    filters: {
      categories: payload.filters.categories,
      difficulties: payload.filters.difficulties,
      questionTypes: payload.filters.questionTypes,
      tags: payload.filters.tags,
    },
    updatedBy: actorId,
  });

  await config.save();

  await recordAdminActivity({
    actorId,
    action: "final-test-config.updated",
    targetType: "final-test-config",
    targetId: config._id.toString(),
    description: `Updated final test configuration ${config.title}`,
  });
  try {
    const { emitFinalTestConfigRealtimeEvent } = await import("./socketService");
    emitFinalTestConfigRealtimeEvent("updated", { id: config._id.toString() });
  } catch (error) {
    logBestEffortFailure("Failed to emit final-test config updated realtime event", error);
  }

  return serializeAdminConfig(config);
};

export const publishAdminFinalTestConfig = async (actorId: string, enabled = true) => {
  const config = await ensureFinalTestConfig(actorId);
  const resolved = await resolveFinalTestQuestions({
    assignedQuestions: getSortedAssignedQuestions(
      (config.assignedQuestions || []).map((item) => ({
        questionId: item.questionId.toString(),
        order: item.order,
      })),
    ),
    questionCount: config.questionCount,
    filters: config.filters,
  });

  if (resolved.questions.length === 0) {
    throw new ApiError(400, "Publish at least one final-test question before enabling the final test");
  }

  config.status = "published";
  config.enabled = enabled;
  config.publishedAt = new Date();
  config.set("updatedBy", actorId);
  await config.save();

  await recordAdminActivity({
    actorId,
    action: "final-test-config.published",
    targetType: "final-test-config",
    targetId: config._id.toString(),
    description: `Published final test configuration ${config.title}`,
  });
  try {
    const { emitFinalTestConfigRealtimeEvent } = await import("./socketService");
    emitFinalTestConfigRealtimeEvent("published", { id: config._id.toString(), enabled: config.enabled });
  } catch (error) {
    logBestEffortFailure("Failed to emit final-test config published realtime event", error);
  }

  return serializeAdminConfig(config);
};

export const unpublishAdminFinalTestConfig = async (actorId: string) => {
  const config = await ensureFinalTestConfig(actorId);

  config.status = "draft";
  config.enabled = false;
  config.set("updatedBy", actorId);
  await config.save();

  await recordAdminActivity({
    actorId,
    action: "final-test-config.unpublished",
    targetType: "final-test-config",
    targetId: config._id.toString(),
    description: `Unpublished final test configuration ${config.title}`,
  });
  try {
    const { emitFinalTestConfigRealtimeEvent } = await import("./socketService");
    emitFinalTestConfigRealtimeEvent("unpublished", { id: config._id.toString(), enabled: config.enabled });
  } catch (error) {
    logBestEffortFailure("Failed to emit final-test config unpublished realtime event", error);
  }

  return serializeAdminConfig(config);
};

export const getActiveFinalTestConfigForUser = async (userId: string) => {
  const config = await FinalTestConfig.findOne({
    status: "published",
    enabled: true,
  }).sort({ updatedAt: -1 });

  if (!config) {
    throw new ApiError(404, "The final test is not available right now");
  }

  const resolved = await resolveFinalTestQuestions({
    assignedQuestions: getSortedAssignedQuestions(
      (config.assignedQuestions || []).map((item) => ({
        questionId: item.questionId.toString(),
        order: item.order,
      })),
    ),
    questionCount: config.questionCount,
    filters: config.filters,
  });

  if (resolved.questions.length === 0) {
    throw new ApiError(400, "The final test is not ready yet because it does not contain any published questions.");
  }

  const submissionCount = await FinalTestSubmission.countDocuments({
    user: userId,
    config: config._id,
  });

  return {
    _id: config._id.toString(),
    title: config.title,
    status: config.status,
    enabled: config.enabled,
    questionCount: config.questionCount,
    timeLimitMinutes: config.timeLimitMinutes,
    passingScore: config.passingScore,
    instructions: config.instructions,
    allowRetake: config.allowRetake,
    totalMarks: resolved.totalMarks,
    canRetake: config.allowRetake || submissionCount === 0,
    previousAttemptCount: submissionCount,
    questions: resolved.questions.map((question, index) => ({
      ...question,
      order: index,
      correctAnswer: undefined,
      explanation: undefined,
    })),
    updatedAt: config.updatedAt,
  };
};

export const getSubmissionFinalTestConfig = async (configId?: string) => {
  const config = configId
    ? await FinalTestConfig.findById(configId)
    : await FinalTestConfig.findOne({
      status: "published",
      enabled: true,
    }).sort({ updatedAt: -1 });

  if (!config) {
    throw new ApiError(404, "The final test is not available right now");
  }

  const resolved = await resolveFinalTestQuestions({
    assignedQuestions: getSortedAssignedQuestions(
      (config.assignedQuestions || []).map((item) => ({
        questionId: item.questionId.toString(),
        order: item.order,
      })),
    ),
    questionCount: config.questionCount,
    filters: config.filters,
  }, true);

  if (resolved.questions.length === 0) {
    throw new ApiError(400, "The final test does not contain any published questions");
  }

  return {
    config,
    questions: resolved.questions,
    totalMarks: resolved.totalMarks,
  };
};
