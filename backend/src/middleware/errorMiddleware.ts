import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import ApiError from "../utils/ApiError";
import { logger } from "../utils/logger";
import { serializeError } from "../utils/logging";

/**
 * Global Error Handling Middleware
 */
const errorConverter = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      typeof err === "object" && err && "statusCode" in err && typeof err.statusCode === "number"
        ? err.statusCode
        : 400;
    const message = err instanceof Error ? err.message : "Something went wrong";
    const stack = err instanceof Error ? err.stack : undefined;
    error = new ApiError(statusCode, message, false, stack);
  }
  next(error);
};

const errorHandler = (err: ApiError | ZodError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 400;
  let message = err.message;
  const stack = err instanceof Error ? err.stack : undefined;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors.map((error) => error.message).join(", ");
  }

  res.locals.errorMessage = message;

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack }),
  };

  if (process.env.NODE_ENV === "development") {
    logger.error("Request failed", {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      ...serializeError(err),
    });
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
