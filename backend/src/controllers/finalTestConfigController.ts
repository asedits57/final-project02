import { Request, Response } from "express";

import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  publishFinalTestConfigSchema,
  upsertFinalTestConfigSchema,
} from "../validators/adminValidator";
import {
  getActiveFinalTestConfigForUser,
  getAdminFinalTestConfig,
  publishAdminFinalTestConfig,
  unpublishAdminFinalTestConfig,
  upsertAdminFinalTestConfig,
} from "../services/finalTestConfigService";

export const getFinalTestConfig = catchAsync(async (_req: Request, res: Response) => {
  const config = await getAdminFinalTestConfig();
  res.json({ success: true, data: config });
});

export const upsertFinalTestConfig = catchAsync(async (req: Request, res: Response) => {
  const payload = upsertFinalTestConfigSchema.parse(req.body);
  const config = await upsertAdminFinalTestConfig(payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: config });
});

export const publishFinalTestConfig = catchAsync(async (req: Request, res: Response) => {
  const { enabled } = publishFinalTestConfigSchema.parse(req.body || {});
  const config = await publishAdminFinalTestConfig(getAuthenticatedUserId(req), enabled);
  res.json({ success: true, data: config });
});

export const unpublishFinalTestConfig = catchAsync(async (req: Request, res: Response) => {
  const config = await unpublishAdminFinalTestConfig(getAuthenticatedUserId(req));
  res.json({ success: true, data: config });
});

export const getUserFinalTestConfig = catchAsync(async (req: Request, res: Response) => {
  const config = await getActiveFinalTestConfigForUser(getAuthenticatedUserId(req));
  res.json({ success: true, data: config });
});
