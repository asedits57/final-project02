import { Request, Response, NextFunction } from "express";
import { sanitizeObject } from "../utils/sanitization";

/**
 * Middleware that recursively sanitizes req.body, req.query, and req.params.
 */
export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
  } catch (error) {
    console.error("Sanitization Error:", error);
    next(); // Continue even if sanitization fails, or handle as error
  }
};
