import { Request, Response } from "express";

import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import { submitFinalTestSchema } from "../validators/adminValidator";
import { submitFinalTestForUser } from "../services/finalTestService";

export const submitFinalTest = catchAsync(async (req: Request, res: Response) => {
  const payload = submitFinalTestSchema.parse(req.body);
  const submission = await submitFinalTestForUser(getAuthenticatedUserId(req), payload);

  res.status(201).json({
    success: true,
    data: submission,
  });
});
