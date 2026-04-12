import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@services/apiClient";
import { finalTestService } from "@services/finalTestService";

vi.mock("@services/apiClient", () => ({
  apiClient: vi.fn(),
}));

describe("finalTestService.submitFinalTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to submitting without recordings when the inline media payload is too large", async () => {
    vi.mocked(apiClient).mockResolvedValue({
      success: true,
      data: { _id: "submission-1" },
    });

    const result = await finalTestService.submitFinalTest({
      testTitle: "Final Test",
      score: 0,
      answers: [],
      recordings: {
        video: {
          dataUrl: "data:video/webm;base64,AAAA",
          sizeBytes: 4 * 1024 * 1024,
        },
      },
    });

    expect(apiClient).toHaveBeenCalledTimes(1);
    const [, request] = vi.mocked(apiClient).mock.calls[0];
    const parsed = JSON.parse(String(request?.body));

    expect(parsed.clientRequestId).toEqual(expect.any(String));
    expect(parsed.recordings).toEqual({});
    expect(parsed.aiEvaluation.submissionTransport.reason).toBe("size-limit");
    expect(result.transportFallbackUsed).toBe(true);
  });

  it("retries once without recordings when the upload transport fails", async () => {
    vi.mocked(apiClient)
      .mockRejectedValueOnce(new Error("The request could not be sent. The upload may be too large or the backend connection dropped."))
      .mockResolvedValueOnce({
        success: true,
        data: { _id: "submission-2" },
      });

    const result = await finalTestService.submitFinalTest({
      testTitle: "Final Test",
      score: 0,
      answers: [],
      recordings: {
        video: {
          dataUrl: "data:video/webm;base64,AAAA",
          sizeBytes: 200_000,
        },
      },
    });

    expect(apiClient).toHaveBeenCalledTimes(2);

    const firstRequest = JSON.parse(String(vi.mocked(apiClient).mock.calls[0][1]?.body));
    const secondRequest = JSON.parse(String(vi.mocked(apiClient).mock.calls[1][1]?.body));

    expect(firstRequest.clientRequestId).toBe(secondRequest.clientRequestId);
    expect(secondRequest.recordings).toEqual({});
    expect(secondRequest.aiEvaluation.submissionTransport.reason).toBe("transport-error");
    expect(result.transportFallbackUsed).toBe(true);
  });
});
