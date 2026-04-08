import { Request, Response } from "express";
import * as aiService from "../services/aiService";
import { aiPromptSchema } from "../validators/aiValidator";
import { sanitize } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";

export const askAI = catchAsync(async (req: Request, res: Response) => {
  // Validate schema
  const { prompt } = aiPromptSchema.parse(req.body);
  // Sanitize string
  const sanitizedPrompt = sanitize(prompt);
  
  const result = await aiService.askAI(sanitizedPrompt);
  res.json(result);
});
