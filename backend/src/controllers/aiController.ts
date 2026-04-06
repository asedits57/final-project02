import { Request, Response } from "express";
import * as aiService from "../services/aiService";
import { aiPromptSchema } from "../validators/aiValidator";
import { sanitize } from "../utils/sanitization";

export const askAI = async (req: Request, res: Response) => {
  try {
    // Validate schema
    const { prompt } = aiPromptSchema.parse(req.body);
    // Sanitize string
    const sanitizedPrompt = sanitize(prompt);
    
    const result = await aiService.askAI(sanitizedPrompt);
    res.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Invalid prompt format", errors: error.errors });
    }
    console.error("AI Error:", error);
    res.status(500).json({ success: false, message: error.message || "AI failed" });
  }
};
