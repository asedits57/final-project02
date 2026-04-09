import { Request, Response } from "express";

import {
  createDailyTaskSchema,
  dailyTaskListQuerySchema,
  objectIdParamSchema,
  taskSubmissionSchema,
  updateDailyTaskSchema,
} from "../validators/adminValidator";
import { sanitizeObject } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  createAdminDailyTask,
  deleteAdminDailyTask,
  getActiveDailyTaskForUser,
  getAdminDailyTaskById,
  getDailyTaskForUserById,
  listAdminDailyTasks,
  publishAdminDailyTask,
  submitDailyTaskForUser,
  unpublishAdminDailyTask,
  updateAdminDailyTask,
} from "../services/dailyTaskService";

export const listDailyTasks = catchAsync(async (req: Request, res: Response) => {
  const query = dailyTaskListQuerySchema.parse(req.query);
  const result = await listAdminDailyTasks(query);
  res.json({ success: true, ...result });
});

export const getDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await getAdminDailyTaskById(id);
  res.json({ success: true, data: task });
});

export const createDailyTask = catchAsync(async (req: Request, res: Response) => {
  const payload = sanitizeObject(createDailyTaskSchema.parse(req.body));
  const task = await createAdminDailyTask(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: task });
});

export const updateDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const payload = sanitizeObject(updateDailyTaskSchema.parse(req.body));
  const task = await updateAdminDailyTask(id, payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const removeDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  await deleteAdminDailyTask(id, getAuthenticatedUserId(req));
  res.json({ success: true, message: "Daily task deleted successfully" });
});

export const publishDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await publishAdminDailyTask(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const unpublishDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await unpublishAdminDailyTask(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const getActiveDailyTask = catchAsync(async (req: Request, res: Response) => {
  const task = await getActiveDailyTaskForUser(getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const getUserDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await getDailyTaskForUserById(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const submitDailyTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const payload = taskSubmissionSchema.parse(req.body);
  const result = await submitDailyTaskForUser(id, getAuthenticatedUserId(req), payload);
  res.status(201).json({ success: true, data: result });
});
