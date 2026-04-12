import { describe, expect, it } from "vitest";

import { getFinalTestLoadState } from "@lib/finalTestLoadState";

describe("getFinalTestLoadState", () => {
  it("marks unavailable final tests with a task-hub action", () => {
    const state = getFinalTestLoadState(
      "The final test is not ready yet because it does not contain any published questions.",
    );

    expect(state.title).toBe("Final test unavailable");
    expect(state.primaryActionPath).toBe("/task");
    expect(state.showRetry).toBe(true);
    expect(state.retryLabel).toBe("Reload page");
  });

  it("marks backend connectivity issues as retryable connection problems", () => {
    const state = getFinalTestLoadState(
      "Could not reach the server. Please check that the backend is running and try again.",
    );

    expect(state.title).toBe("Connection issue");
    expect(state.primaryActionPath).toBe("/task");
    expect(state.showRetry).toBe(true);
    expect(state.retryLabel).toBe("Try again");
  });

  it("routes expired sessions back to sign in", () => {
    const state = getFinalTestLoadState("Session expired. Please log in again.");

    expect(state.title).toBe("Session expired");
    expect(state.primaryActionPath).toBe("/login");
    expect(state.primaryActionLabel).toBe("Go to sign in");
    expect(state.showRetry).toBe(false);
  });
});
