import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error: unknown) {
      return res.status(400).json({
        error: "Validation failed",
        details: error instanceof ZodError ? error.errors : [],
      });
    }
  };
};
