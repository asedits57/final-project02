import type { Request, Response, NextFunction } from "express";
import { ensureDatabaseConnection } from "../config/db";

export const ensureDatabaseReady = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    next(error);
  }
};
