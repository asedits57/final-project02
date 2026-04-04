import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error: any) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
  };
};
