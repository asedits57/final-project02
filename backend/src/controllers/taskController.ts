import { Request, Response } from "express";

import {
  createTaskSchema,
  objectIdParamSchema,
  taskListQuerySchema,
  taskSubmissionSchema,
  updateTaskSchema,
} from "../validators/adminValidator";
import { sanitizeObject } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  createAdminTask,
  deleteAdminTask,
  getAdminTaskById,
  getUserTaskById,
  listAdminTasks,
  listUserTasks,
  publishAdminTask,
  submitUserTask,
  unpublishAdminTask,
  updateAdminTask,
} from "../services/taskService";

export const listTasks = catchAsync(async (req: Request, res: Response) => {
  const query = taskListQuerySchema.parse(req.query);
  const result = await listAdminTasks(query);
  res.json({ success: true, ...result });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await getAdminTaskById(id);
  res.json({ success: true, data: task });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const payload = sanitizeObject(createTaskSchema.parse(req.body));
  const task = await createAdminTask(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: task });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const payload = sanitizeObject(updateTaskSchema.parse(req.body));
  const task = await updateAdminTask(id, payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const removeTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  await deleteAdminTask(id, getAuthenticatedUserId(req));
  res.json({ success: true, message: "Task deleted successfully" });
});

export const publishTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await publishAdminTask(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const unpublishTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await unpublishAdminTask(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const listUserVisibleTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await listUserTasks(getAuthenticatedUserId(req));
  res.json({ success: true, data: tasks });
});

export const getUserVisibleTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const task = await getUserTaskById(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: task });
});

export const submitTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const payload = taskSubmissionSchema.parse(req.body);
  const result = await submitUserTask(id, getAuthenticatedUserId(req), payload);
  res.status(201).json({ success: true, data: result });
});
