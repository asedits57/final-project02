import { Request, Response } from "express";

import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  adminNotificationListQuerySchema,
  createAdminNotificationSchema,
  objectIdParamSchema,
  userNotificationListQuerySchema,
} from "../validators/adminValidator";
import {
  createAdminNotification,
  listAdminNotifications,
  listUserNotifications,
  markNotificationReadForUser,
} from "../services/notificationService";

export const listNotifications = catchAsync(async (req: Request, res: Response) => {
  const query = adminNotificationListQuerySchema.parse(req.query);
  const notifications = await listAdminNotifications(query);
  res.json({ success: true, ...notifications });
});

export const createNotification = catchAsync(async (req: Request, res: Response) => {
  const payload = createAdminNotificationSchema.parse(req.body);
  const notification = await createAdminNotification(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: notification });
});

export const listUserVisibleNotifications = catchAsync(async (req: Request, res: Response) => {
  const query = userNotificationListQuerySchema.parse(req.query);
  const notifications = await listUserNotifications(getAuthenticatedUserId(req), query);
  res.json({ success: true, data: notifications });
});

export const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const notification = await markNotificationReadForUser(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: notification });
});
