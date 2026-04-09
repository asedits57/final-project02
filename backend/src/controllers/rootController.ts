import { Request, Response } from "express";
import { getDatabaseStatus } from "../config/db";

// ✅ DIAGNOSTIC HANDLERS
export const getRoot = (req: Request, res: Response) => {
  res.send("API Running 🚀");
};

export const getApiStatus = (req: Request, res: Response) => {
  res.json({
    status: "API Working",
    version: "1.0.0",
    database: getDatabaseStatus(),
  });
};

// ✅ TEST HANDLER
export const getTest = (req: Request, res: Response) => {
  res.json({ message: "Backend working ✅" });
};
