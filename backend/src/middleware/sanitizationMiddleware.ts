import { Request, Response, NextFunction } from "express";
import { sanitizeObject } from "../utils/sanitization";
import { logger } from "../utils/logger";
import { serializeError } from "../utils/logging";

/**
 * Middleware that recursively sanitizes req.body, req.query, and req.params.
 */
export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      for (const key in req.query) {
        req.query[key as string] = sanitizeObject(req.query[key as string]);
      }
    }
    if (req.params) {
      for (const key in req.params) {
        req.params[key] = sanitizeObject(req.params[key]);
      }
    }
    next();
  } catch (error) {
    logger.warn("Sanitization middleware failed", serializeError(error));
    next(); // Continue even if sanitization fails, or handle as error
  }
};
