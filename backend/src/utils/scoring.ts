const normalizePrimitive = (value: string | number | boolean) => String(value).trim().toLowerCase();

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
