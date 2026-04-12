import { Request, Response } from "express";

import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import { submitFinalTestSchema } from "../validators/adminValidator";
import { submitFinalTestForUser } from "../services/finalTestService";
import { getActiveFinalTestConfigForUser } from "../services/finalTestConfigService";

export const getFinalTestConfig = catchAsync(async (req: Request, res: Response) => {
  const config = await getActiveFinalTestConfigForUser(getAuthenticatedUserId(req));
  res.json({
    success: true,
    data: config,
  });
});

export const submitFinalTest = catchAsync(async (req: Request, res: Response) => {
  const payload = submitFinalTestSchema.parse(req.body);
  const submission = await submitFinalTestForUser(getAuthenticatedUserId(req), payload);

  res.status(201).json({
    success: true,
    data: submission,
  });
});
