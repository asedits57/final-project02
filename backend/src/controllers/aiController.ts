import { Request, Response } from "express";
import * as aiService from "../services/aiService";

export const askAI = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  try {
    const result = await aiService.askAI(prompt);
    res.json(result);
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, message: error.message || "AI failed" });
  }
};
