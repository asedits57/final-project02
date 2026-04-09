export type AIErrorCode =
  | "missing_api_key"
  | "invalid_api_key"
  | "quota_exceeded"
  | "rate_limited"
  | "service_unavailable"
  | "unknown";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  return String(error || "");
};

export const classifyAIError = (error: unknown): AIErrorCode => {
  const message = getErrorMessage(error);
  const lowerMessage = message.toLowerCase();
  const status = typeof (error as { status?: unknown })?.status === "number"
    ? Number((error as { status?: number }).status)
    : undefined;
  const code = String((error as { code?: unknown })?.code || "").toLowerCase();

  if (message.includes("OPENAI_API_KEY_MISSING")) {
    return "missing_api_key";
  }

  if (lowerMessage.includes("incorrect api key") || lowerMessage.includes("invalid api key")) {
    return "invalid_api_key";
  }

  if (
    code === "insufficient_quota" ||
    lowerMessage.includes("insufficient_quota") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("billing")
  ) {
    return "quota_exceeded";
  }

  if (status === 429) {
    return "rate_limited";
  }

  if (
    status === 408 ||
    (typeof status === "number" && status >= 500) ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("timed out") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("econnreset") ||
    lowerMessage.includes("socket hang up")
  ) {
    return "service_unavailable";
  }

  return "unknown";
};

export const isRetryableAIError = (error: unknown) => {
  const code = classifyAIError(error);
  return code === "rate_limited" || code === "service_unavailable";
};

export const getFriendlyAIErrorReply = (error: unknown) => {
  const code = classifyAIError(error);

  if (code === "missing_api_key") {
    return "AI is not configured yet. Add OPENAI_API_KEY to backend/.env and restart the backend server.";
  }

  if (code === "invalid_api_key") {
    return "The configured OpenAI API key looks invalid. Update OPENAI_API_KEY in backend/.env and restart the backend server.";
  }

  if (code === "quota_exceeded") {
    return "AI is temporarily unavailable because the configured OpenAI account has no remaining quota. Add billing or replace OPENAI_API_KEY in backend/.env, then restart the backend server.";
  }

  if (code === "rate_limited") {
    return "AI is receiving too many requests right now. Please wait a moment and try again.";
  }

  return "I'm having a little trouble thinking of an answer right now. Could you please check your internet connection or try asking again in a few moments?";
};
