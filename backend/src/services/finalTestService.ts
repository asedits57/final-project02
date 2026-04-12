import path from "path";
import { promises as fs } from "fs";

import FinalTestSubmission from "../models/FinalTestSubmission";
import ApiError from "../utils/ApiError";
import { logBestEffortFailure } from "../utils/bestEffort";
import { answerMatchesQuestion } from "../utils/scoring";
import { getSubmissionFinalTestConfig } from "./finalTestConfigService";

type FinalTestAnswer = {
  questionId?: string;
  answer: string | number | boolean | string[];
};

type FinalTestRecordingInput = {
  dataUrl: string;
  mimeType?: string;
  durationSeconds?: number;
  sizeBytes?: number;
};

type FinalTestSubmissionPayload = {
  clientRequestId?: string;
  configId?: string;
  testTitle: string;
  testCategory: string;
  answers: FinalTestAnswer[];
  aiEvaluation?: Record<string, unknown>;
  score: number;
  flags: string[];
  recommendation?: string;
  responseTranscript?: string;
  proctoring: {
    riskScore: number;
    events: Array<{
      time: string;
      message: string;
      type: "info" | "success" | "warning" | "danger";
      source: "camera" | "voice" | "screen" | "system";
    }>;
  };
  recordings: {
    audio?: FinalTestRecordingInput;
    video?: FinalTestRecordingInput;
  };
};

const UPLOADS_ROOT = path.join(process.cwd(), "uploads", "final-tests");

const mimeExtensionMap: Record<string, string> = {
  "audio/webm": ".webm",
  "audio/wav": ".wav",
  "audio/wave": ".wav",
  "audio/x-wav": ".wav",
  "audio/mp4": ".m4a",
  "audio/mpeg": ".mp3",
  "video/webm": ".webm",
  "video/mp4": ".mp4",
};

const ensureUploadsRoot = async () => {
  await fs.mkdir(UPLOADS_ROOT, { recursive: true });
};

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid recording payload");
  }

  return {
    mimeType: match[1].trim().toLowerCase(),
    base64: match[2],
  };
};

const inferExtension = (mimeType: string) => mimeExtensionMap[mimeType] || "";

const writeRecordingAsset = async (
  submissionId: string,
  kind: "audio" | "video",
  asset?: FinalTestRecordingInput,
) => {
  if (!asset?.dataUrl) {
    return undefined;
  }

  const parsed = parseDataUrl(asset.dataUrl);
  const buffer = Buffer.from(parsed.base64, "base64");

  await ensureUploadsRoot();

  const extension = inferExtension(asset.mimeType?.toLowerCase() || parsed.mimeType) || (kind === "audio" ? ".webm" : ".webm");
  const filename = `${submissionId}-${kind}${extension}`;
  const absolutePath = path.join(UPLOADS_ROOT, filename);

  await fs.writeFile(absolutePath, buffer);

  return {
    url: `/uploads/final-tests/${filename}`,
    mimeType: asset.mimeType || parsed.mimeType,
    durationSeconds: asset.durationSeconds,
    sizeBytes: asset.sizeBytes || buffer.byteLength,
  };
};

const buildRecommendation = (score: number, passingScore: number) => {
  if (score >= Math.max(85, passingScore + 20)) {
    return "Excellent final-test performance. Keep building consistency across all modules.";
  }
  if (score >= passingScore) {
    return "You passed the final test. Review your weaker categories once more before the next milestone.";
  }
  return "The final test is below the passing threshold. Revisit the learning hub, focus on weak question types, and try again.";
};

const getPopulatedSubmissionById = (submissionId: string) =>
  FinalTestSubmission.findById(submissionId)
    .populate("user", "email fullName username score level streak")
    .populate("config")
    .lean();

const getPopulatedSubmissionByClientRequestId = (userId: string, clientRequestId: string) =>
  FinalTestSubmission.findOne({
    user: userId,
    clientRequestId,
  })
    .populate("user", "email fullName username score level streak")
    .populate("config")
    .lean();

const isDuplicateClientRequestError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeMongoError = error as { code?: number; keyPattern?: Record<string, unknown> };
  return maybeMongoError.code === 11000 && Boolean(maybeMongoError.keyPattern?.clientRequestId);
};

export const submitFinalTestForUser = async (userId: string, payload: FinalTestSubmissionPayload) => {
  if (payload.clientRequestId) {
    const existingSubmission = await getPopulatedSubmissionByClientRequestId(userId, payload.clientRequestId);
    if (existingSubmission) {
      return existingSubmission;
    }
  }

  const { config, questions, totalMarks } = await getSubmissionFinalTestConfig(payload.configId);

  if (!config.allowRetake) {
    const existingSubmission = await FinalTestSubmission.findOne({
      user: userId,
      config: config._id,
    }).lean();

    if (existingSubmission) {
      throw new ApiError(409, "Retakes are disabled for the current final test configuration");
    }
  }

  const normalizedFlags = payload.flags.length > 0
    ? payload.flags
    : payload.proctoring.events
      .filter((event) => event.type === "warning" || event.type === "danger")
      .map((event) => event.message);

  const answerMap = new Map(
    payload.answers
      .filter((answer) => typeof answer.questionId === "string" && answer.questionId.trim())
      .map((answer) => [String(answer.questionId), answer.answer]),
  );

  let rawScore = 0;
  const evaluatedAnswers = questions.map((question) => {
    const answer = answerMap.get(question._id);
    const points = Math.max(1, Number(question.points || 1));
    const isCorrect =
      answer !== undefined &&
      question.correctAnswer !== undefined &&
      answerMatchesQuestion(question, answer);

    if (isCorrect) {
      rawScore += points;
    }

    return {
      questionId: question._id,
      answer: answer ?? "",
      isCorrect,
    };
  });

  const maxScore = Math.max(0, totalMarks || questions.reduce((total, question) => total + Math.max(1, Number(question.points || 1)), 0));
  const normalizedScore = maxScore > 0
    ? Math.max(0, Math.min(100, Math.round((rawScore / maxScore) * 100)))
    : Math.max(0, Math.min(100, Math.round(payload.score)));
  const passed = normalizedScore >= config.passingScore;

  let submission;

  try {
    submission = await FinalTestSubmission.create({
      config: config._id,
      user: userId,
      clientRequestId: payload.clientRequestId,
      testTitle: config.title || payload.testTitle,
      testCategory: payload.testCategory || "final-test",
      answers: evaluatedAnswers,
      aiEvaluation: payload.aiEvaluation,
      score: normalizedScore,
      rawScore,
      maxScore,
      passingScore: config.passingScore,
      passed,
      questionCount: questions.length,
      flags: normalizedFlags,
      recommendation: payload.recommendation || buildRecommendation(normalizedScore, config.passingScore),
      responseTranscript: payload.responseTranscript || "",
      proctoring: payload.proctoring,
      reviewStatus: "pending",
    });
  } catch (error) {
    if (payload.clientRequestId && isDuplicateClientRequestError(error)) {
      const existingSubmission = await getPopulatedSubmissionByClientRequestId(userId, payload.clientRequestId);
      if (existingSubmission) {
        return existingSubmission;
      }
    }

    throw error;
  }

  const [audioRecording, videoRecording] = await Promise.all([
    writeRecordingAsset(submission._id.toString(), "audio", payload.recordings.audio),
    writeRecordingAsset(submission._id.toString(), "video", payload.recordings.video),
  ]);

  if (audioRecording || videoRecording) {
    submission.recordings = {
      ...(audioRecording ? { audio: audioRecording } : {}),
      ...(videoRecording ? { video: videoRecording } : {}),
    };
    await submission.save();
  }

  const savedSubmission = await getPopulatedSubmissionById(submission._id.toString());

  try {
    const { emitFinalTestSubmissionRealtimeEvent } = await import("./socketService");
    emitFinalTestSubmissionRealtimeEvent("created", {
      id: submission._id.toString(),
      configId: config._id.toString(),
      score: normalizedScore,
      passed,
    });
  } catch (error) {
    logBestEffortFailure("Failed to emit final-test submission realtime event", error);
  }

  return savedSubmission;
};
