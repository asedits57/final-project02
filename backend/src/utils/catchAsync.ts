import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous middleware/controller function
 * to catch any errors and forward them to the next error middleware.
 */
const catchAsync = (fn: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
