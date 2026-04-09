import path from "path";
import { promises as fs } from "fs";

import FinalTestSubmission from "../models/FinalTestSubmission";

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

export const submitFinalTestForUser = async (userId: string, payload: FinalTestSubmissionPayload) => {
  const normalizedFlags = payload.flags.length > 0
    ? payload.flags
    : payload.proctoring.events
      .filter((event) => event.type === "warning" || event.type === "danger")
      .map((event) => event.message);

  const submission = await FinalTestSubmission.create({
    user: userId,
    testTitle: payload.testTitle,
    testCategory: payload.testCategory,
    answers: payload.answers,
    aiEvaluation: payload.aiEvaluation,
    score: Math.max(0, Math.min(100, Math.round(payload.score))),
    flags: normalizedFlags,
    recommendation: payload.recommendation,
    responseTranscript: payload.responseTranscript || "",
    proctoring: payload.proctoring,
    reviewStatus: "pending",
  });

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

  return FinalTestSubmission.findById(submission._id)
    .populate("user", "email fullName username score level streak")
    .lean();
};
