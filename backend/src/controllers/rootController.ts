import { Request, Response } from "express";

// ✅ DIAGNOSTIC HANDLERS
export const getRoot = (req: Request, res: Response) => {
  res.send("API Running 🚀");
};

export const getApiStatus = (req: Request, res: Response) => {
  res.json({ status: "API Working", version: "1.0.0" });
};

// ✅ TEST HANDLER
export const getTest = (req: Request, res: Response) => {
  res.json({ message: "Backend working ✅" });
};
