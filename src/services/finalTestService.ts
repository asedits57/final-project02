import { apiClient } from "@services/apiClient";
import type { AdminFinalTestRecord } from "@services/adminService";
import { estimateDataUrlBytes, formatBytesToMb, MAX_FINAL_TEST_RECORDINGS_BYTES } from "@lib/uploadLimits";

type FinalTestSubmitPayload = {
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
};

export const finalTestService = {
  submitFinalTest(payload: FinalTestSubmitPayload): Promise<FinalTestSubmitResponse> {
    const totalRecordingBytes = [
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

    if (totalRecordingBytes > MAX_FINAL_TEST_RECORDINGS_BYTES) {
      return Promise.reject(new Error(
        `Recorded media is too large to send right now. Keep the combined audio and video under ${formatBytesToMb(MAX_FINAL_TEST_RECORDINGS_BYTES)}.`,
      ));
    }

    return apiClient<FinalTestSubmitResponse>("/final-tests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
