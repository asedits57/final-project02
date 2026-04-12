import Notification from "../models/Notification";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { logBestEffortFailure } from "../utils/bestEffort";
import { buildSearchRegex, getPagination } from "../utils/query";
import { recordAdminActivity } from "./adminActivityService";

type NotificationAudience = {
  scope: "all" | "users" | "admins" | "dept" | "status";
  dept?: string;
  status?: "active" | "suspended";
};

type CreateNotificationPayload = {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "critical";
  actionLink?: string;
  audience: NotificationAudience;
};

type NotificationListFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  audienceScope?: string;
};

const buildAudienceQueryForUser = (user: {
  role: "user" | "admin";
  dept?: string;
  status: "active" | "suspended";
}) => ({
  $or: [
    { "audience.scope": "all" },
    { "audience.scope": user.role === "admin" ? "admins" : "users" },
    ...(user.dept ? [{ "audience.scope": "dept", "audience.dept": user.dept }] : []),
    { "audience.scope": "status", "audience.status": user.status },
  ],
});

const buildAdminNotificationQuery = (filters: Omit<NotificationListFilters, "page" | "limit">) => {
  const query: Record<string, unknown> = {};
  const searchRegex = buildSearchRegex(filters.search);

  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.audienceScope) {
    query["audience.scope"] = filters.audienceScope;
  }
  if (searchRegex) {
    query.$or = [
      { title: searchRegex },
      { message: searchRegex },
    ];
  }

  return query;
};

const serializeNotification = (
  notification: Record<string, unknown> & { readBy?: Array<{ user?: { toString(): string }; readAt?: string | Date }> },
  currentUserId?: string,
) => {
  const readRecord = currentUserId
    ? notification.readBy?.find((entry) => entry.user?.toString() === currentUserId)
    : undefined;

  return {
    ...notification,
    _id: String(notification._id),
    isRead: Boolean(readRecord),
    readAt: readRecord?.readAt,
  };
};

export const createAdminNotification = async (payload: CreateNotificationPayload, actorId: string) => {
  const notification = await Notification.create({
    title: payload.title,
    message: payload.message,
    type: payload.type,
    actionLink: payload.actionLink,
    audience: payload.audience,
    createdBy: actorId,
  });

  await recordAdminActivity({
    actorId,
    action: "notification.broadcast",
    targetType: "notification",
    targetId: notification._id.toString(),
    description: `Broadcast notification ${payload.title}`,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("createdBy", "email fullName role")
    .lean();

  try {
    const { emitNotificationRealtimeEvent } = await import("./socketService");
    emitNotificationRealtimeEvent(payload.audience, populatedNotification);
  } catch (error) {
    logBestEffortFailure("Failed to emit notification realtime event", error);
  }

  return populatedNotification;
};

export const listAdminNotifications = async (filters: NotificationListFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const query = buildAdminNotificationQuery(filters);

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "email fullName role")
      .lean(),
    Notification.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const listUserNotifications = async (
  userId: string,
  filters: { limit: number; unreadOnly: boolean },
) => {
  const user = await User.findById(userId).select("role dept status").lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const query: Record<string, unknown> = buildAudienceQueryForUser({
    role: user.role || "user",
    dept: typeof user.dept === "string" ? user.dept : undefined,
    status: user.status || "active",
  });

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit)
    .populate("createdBy", "email fullName role")
    .lean();

  const serialized = notifications.map((notification) => serializeNotification(notification as Record<string, unknown>, userId));
  const filtered = filters.unreadOnly
    ? serialized.filter((notification) => !notification.isRead)
    : serialized;

  return {
    items: filtered,
    unreadCount: serialized.filter((notification) => !notification.isRead).length,
  };
};

export const markNotificationReadForUser = async (notificationId: string, userId: string) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  const user = await User.findById(userId).select("role dept status").lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const matchesAudience =
    notification.audience.scope === "all" ||
    (notification.audience.scope === "admins" && user.role === "admin") ||
    (notification.audience.scope === "users" && user.role !== "admin") ||
    (notification.audience.scope === "dept" && notification.audience.dept === user.dept) ||
    (notification.audience.scope === "status" && notification.audience.status === user.status);

  if (!matchesAudience) {
    throw new ApiError(403, "This notification is not available to the current user");
  }

  if (!notification.readBy.some((entry) => entry.user.toString() === userId)) {
    notification.readBy.push({
      user: userId as never,
      readAt: new Date(),
    });
    await notification.save();
  }

  const savedNotification = await Notification.findById(notificationId)
    .populate("createdBy", "email fullName role")
    .lean();

  return serializeNotification(savedNotification as Record<string, unknown>, userId);
};

export const getRecentAdminNotifications = async (limit = 5) => {
  return Notification.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("createdBy", "email fullName role")
    .lean();
};
