import { Request, Response } from "express";
import { z } from "zod";

import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import { objectIdParamSchema } from "../validators/adminValidator";
import {
  completeLearningGuideForUser,
  completeLearningVideoForUser,
  getLearningProgressSummary,
} from "../services/learningProgressService";

const guideKeyParamSchema = z.object({
  guideKey: z.string().trim().min(2).max(80),
});

export const getLearningProgress = catchAsync(async (req: Request, res: Response) => {
  const summary = await getLearningProgressSummary(getAuthenticatedUserId(req));
  res.json({ success: true, data: summary });
});

export const completeLearningGuide = catchAsync(async (req: Request, res: Response) => {
  const { guideKey } = guideKeyParamSchema.parse(req.params);
  const result = await completeLearningGuideForUser(getAuthenticatedUserId(req), guideKey);
  res.status(result.alreadyCompleted ? 200 : 201).json({ success: true, data: result });
});

export const completeLearningVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const result = await completeLearningVideoForUser(getAuthenticatedUserId(req), id);
  res.status(result.alreadyCompleted ? 200 : 201).json({ success: true, data: result });
});
