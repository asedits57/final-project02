import xss from "xss";

const MAX_SANITIZE_STRING_LENGTH = 20_000;

const shouldSkipStringSanitization = (content: string) => {
  const trimmed = content.trimStart();

  return (
    trimmed.startsWith("data:") ||
    content.length > MAX_SANITIZE_STRING_LENGTH
  );
};

/**
 * Sanitizes a string by stripping out XSS-prone characters.
 */
export const sanitize = (content: string): string => {
  if (shouldSkipStringSanitization(content)) {
    return content;
  }

  return xss(content);
};

/**
 * Recursively sanitizes an object or array.
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (typeof obj === "string") return sanitize(obj) as T;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item)) as T;
  
  // Only recurse into plain objects
  if (obj !== null && typeof obj === "object" && Object.getPrototypeOf(obj) === Object.prototype) {
    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      newObj[key] = sanitizeObject(value);
    }
    return newObj as T;
  }
  
  return obj;
};
