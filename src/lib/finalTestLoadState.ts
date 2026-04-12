export type FinalTestLoadState = {
  title: string;
  message: string;
  primaryActionLabel: string;
  primaryActionPath: "/login" | "/task";
  retryLabel: string;
  showRetry: boolean;
};

const includesAny = (message: string, patterns: string[]) =>
  patterns.some((pattern) => message.includes(pattern));

export const getFinalTestLoadState = (rawMessage?: string | null): FinalTestLoadState => {
  const message = rawMessage?.trim() || "The final test is unavailable right now.";
  const normalizedMessage = message.toLowerCase();

  if (
    includesAny(normalizedMessage, [
      "session expired",
      "log in again",
      "invalid token",
      "not authorized",
      "unauthorized",
    ])
  ) {
    return {
      title: "Session expired",
      message: "Your sign-in session ended. Please sign in again to continue with the final test.",
      primaryActionLabel: "Go to sign in",
      primaryActionPath: "/login",
      retryLabel: "Try again",
      showRetry: false,
    };
  }

  if (
    includesAny(normalizedMessage, [
      "could not reach the server",
      "request could not be sent",
      "connection dropped",
      "network error",
      "failed to fetch",
    ])
  ) {
    return {
      title: "Connection issue",
      message,
      primaryActionLabel: "Back to Task Hub",
      primaryActionPath: "/task",
      retryLabel: "Try again",
      showRetry: true,
    };
  }

  if (
    includesAny(normalizedMessage, [
      "final test is not available",
      "not available right now",
      "not ready",
      "published questions",
      "no published questions",
    ])
  ) {
    return {
      title: "Final test unavailable",
      message,
      primaryActionLabel: "Back to Task Hub",
      primaryActionPath: "/task",
      retryLabel: "Reload page",
      showRetry: true,
    };
  }

  return {
    title: "Could not load the final test",
    message,
    primaryActionLabel: "Back to Task Hub",
    primaryActionPath: "/task",
    retryLabel: "Try again",
    showRetry: true,
  };
};
