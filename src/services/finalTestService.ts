import { apiClient } from "@services/apiClient";
import type { AdminFinalTestRecord } from "@services/adminService";
import { estimateDataUrlBytes, formatBytesToMb, MAX_FINAL_TEST_RECORDINGS_BYTES } from "@lib/uploadLimits";

export type FinalTestQuestionRecord = {
  _id: string;
  order: number;
  title: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer" | "fill_blank";
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  points: number;
};

export type FinalTestConfigResponseRecord = {
  _id: string;
  title: string;
  status: "draft" | "published" | "archived";
  enabled: boolean;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  instructions: string;
  allowRetake: boolean;
  totalMarks: number;
  canRetake: boolean;
  previousAttemptCount: number;
  questions: FinalTestQuestionRecord[];
  updatedAt?: string;
};

type FinalTestSubmitPayload = {
  clientRequestId?: string;
  configId?: string;
  testTitle: string;
  testCategory?: string;
  answers?: Array<{
    questionId?: string;
    answer: string | number | boolean | string[];
  }>;
  aiEvaluation?: Record<string, unknown>;
  score: number;
  flags?: string[];
  recommendation?: string;
  responseTranscript?: string;
  proctoring?: {
    riskScore?: number;
    events?: Array<{
      time: string;
      message: string;
      type: "info" | "success" | "warning" | "danger";
      source: "camera" | "voice" | "screen" | "system";
    }>;
  };
  recordings?: {
    audio?: {
      dataUrl: string;
      mimeType?: string;
      durationSeconds?: number;
      sizeBytes?: number;
    };
    video?: {
      dataUrl: string;
      mimeType?: string;
      durationSeconds?: number;
      sizeBytes?: number;
    };
  };
};

type FinalTestSubmitResponse = {
  success: boolean;
  data: AdminFinalTestRecord;
  transportFallbackUsed?: boolean;
  transportMessage?: string;
};

type FinalTestConfigResponse = {
  success: boolean;
  data: FinalTestConfigResponseRecord;
};

const MAX_INLINE_FINAL_TEST_RECORDINGS_BYTES = 3 * 1024 * 1024;

const createClientRequestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `final-test-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getTotalRecordingBytes = (payload: FinalTestSubmitPayload) =>
  [
    payload.recordings?.audio,
    payload.recordings?.video,
  ]
    .filter(Boolean)
    .reduce((total, recording) => {
      if (!recording) {
        return total;
      }

      return total + (recording.sizeBytes || estimateDataUrlBytes(recording.dataUrl));
    }, 0);

const hasRecordings = (payload: FinalTestSubmitPayload) =>
  Boolean(payload.recordings?.audio || payload.recordings?.video);

const buildRecordingFallbackPayload = (
  payload: FinalTestSubmitPayload,
  totalRecordingBytes: number,
  reason: "size-limit" | "transport-error",
): FinalTestSubmitPayload => ({
  ...payload,
  aiEvaluation: {
    ...(payload.aiEvaluation ?? {}),
    submissionTransport: {
      recordingsIncluded: false,
      reason,
      estimatedRecordingBytes: totalRecordingBytes,
    },
  },
  recordings: {},
});

const shouldRetryWithoutRecordings = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return [
    "request could not be sent",
    "upload may be too large",
    "failed to fetch",
    "networkerror",
    "network error",
    "payload too large",
    "request entity too large",
    "bad gateway",
    "gateway timeout",
  ].some((fragment) => message.includes(fragment));
};

export const finalTestService = {
  getFinalTestConfig(): Promise<FinalTestConfigResponse> {
    return apiClient<FinalTestConfigResponse>("/final-tests/config");
  },

  submitFinalTest(payload: FinalTestSubmitPayload): Promise<FinalTestSubmitResponse> {
    const clientRequestId = payload.clientRequestId || createClientRequestId();
    const payloadWithRequestId = {
      ...payload,
      clientRequestId,
    };
    const totalRecordingBytes = getTotalRecordingBytes(payloadWithRequestId);
    const recordingsAttached = hasRecordings(payloadWithRequestId);

    if (recordingsAttached && totalRecordingBytes > MAX_FINAL_TEST_RECORDINGS_BYTES) {
      const fallbackPayload = buildRecordingFallbackPayload(payloadWithRequestId, totalRecordingBytes, "size-limit");

      return apiClient<FinalTestSubmitResponse>("/final-tests", {
        method: "POST",
        body: JSON.stringify(fallbackPayload),
      }).then((response) => ({
        ...response,
        transportFallbackUsed: true,
        transportMessage: `Final test submitted without recorded media because the upload exceeded ${formatBytesToMb(MAX_FINAL_TEST_RECORDINGS_BYTES)}.`,
      }));
    }

    const primaryPayload = recordingsAttached && totalRecordingBytes > MAX_INLINE_FINAL_TEST_RECORDINGS_BYTES
      ? buildRecordingFallbackPayload(payloadWithRequestId, totalRecordingBytes, "size-limit")
      : payloadWithRequestId;

    return apiClient<FinalTestSubmitResponse>("/final-tests", {
      method: "POST",
      body: JSON.stringify(primaryPayload),
    })
      .then((response) => (
        primaryPayload === payloadWithRequestId
          ? response
          : {
            ...response,
            transportFallbackUsed: true,
            transportMessage: "Final test submitted without recorded media so the upload would stay stable.",
          }
      ))
      .catch(async (error) => {
        if (!recordingsAttached || primaryPayload !== payloadWithRequestId || !shouldRetryWithoutRecordings(error)) {
          throw error;
        }

        const fallbackPayload = buildRecordingFallbackPayload(payloadWithRequestId, totalRecordingBytes, "transport-error");
        const response = await apiClient<FinalTestSubmitResponse>("/final-tests", {
          method: "POST",
          body: JSON.stringify(fallbackPayload),
        });

        return {
          ...response,
          transportFallbackUsed: true,
          transportMessage: "Final test submitted without recorded media because the connection dropped during upload.",
        };
      });
  },
};
