const normalizePrimitive = (value: string | number | boolean) => String(value).trim().toLowerCase();

const resolveIndexedAnswer = (expected: unknown, options?: unknown) => {
  const optionIndex =
    typeof expected === "number"
      ? expected
      : typeof expected === "string" && /^\d+$/.test(expected.trim())
        ? Number(expected.trim())
        : null;

  if (optionIndex === null || !Array.isArray(options)) {
    return expected;
  }

  const resolvedOption = options[optionIndex];
  if (
    typeof resolvedOption === "string" ||
    typeof resolvedOption === "number" ||
    typeof resolvedOption === "boolean"
  ) {
    return resolvedOption;
  }

  return expected;
};

export const answersMatch = (expected: unknown, received: unknown): boolean => {
  if (Array.isArray(expected) && Array.isArray(received)) {
    const normalizedExpected = expected.map((item) => normalizePrimitive(item as string | number | boolean)).sort();
    const normalizedReceived = received.map((item) => normalizePrimitive(item as string | number | boolean)).sort();
    return JSON.stringify(normalizedExpected) === JSON.stringify(normalizedReceived);
  }

  if (
    (typeof expected === "string" || typeof expected === "number" || typeof expected === "boolean") &&
    (typeof received === "string" || typeof received === "number" || typeof received === "boolean")
  ) {
    return normalizePrimitive(expected) === normalizePrimitive(received);
  }

  return false;
};

export const answerMatchesQuestion = (
  question: { correctAnswer?: unknown; options?: unknown },
  received: unknown,
): boolean => answersMatch(resolveIndexedAnswer(question.correctAnswer, question.options), received);
