import xss from "xss";

/**
 * Sanitizes a string by stripping out XSS-prone characters.
 */
export const sanitize = (content: string): string => {
  return xss(content);
};

/**
 * Recursively sanitizes an object or array.
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") return sanitize(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  // Only recurse into plain objects
  if (obj !== null && typeof obj === "object" && Object.getPrototypeOf(obj) === Object.prototype) {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = sanitizeObject(obj[key]);
    }
    return newObj;
  }
  
  return obj;
};
