import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous middleware/controller function
 * to catch any errors and forward them to the next error middleware.
 */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
