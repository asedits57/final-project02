import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

/**
 * Global Error Handling Middleware
 */
const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 400;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;

  // Handle Zod Validation Errors
  if (err.name === "ZodError") {
    statusCode = 400;
    // @ts-ignore
    message = err.errors.map((e: any) => e.message).join(", ");
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
