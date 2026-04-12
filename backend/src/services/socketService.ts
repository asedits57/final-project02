import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

import User from "../models/User";
import { logger } from "../utils/logger";
import { serializeError } from "../utils/logging";

let io: Server;

type AuthenticatedSocketUser = {
  id: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  dept?: string;
};

type SocketBroadcastTarget = {
  emit: (...args: unknown[]) => void;
};

type SocketTransport = Server | {
  emit: (...args: unknown[]) => void;
  on: (...args: unknown[]) => void;
  off: (...args: unknown[]) => void;
  to: (...args: unknown[]) => SocketBroadcastTarget;
  in: (...args: unknown[]) => SocketBroadcastTarget;
};

type RealtimeActionPayload = {
  action: string;
  payload?: unknown;
  occurredAt: string;
};

type NotificationAudience = {
  scope: "all" | "users" | "admins" | "dept" | "status";
  dept?: string;
  status?: "active" | "suspended";
};

const socketUsers = new Map<string, AuthenticatedSocketUser>();
const userSockets = new Map<string, Set<string>>();
const socketActivities = new Map<string, Set<string>>();

const getSocketToken = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authHeader = socket.handshake.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
};

const normalizeActivityName = (activity?: string | null) => {
  const normalized = String(activity || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return normalized || "practice";
};

const normalizeDept = (dept?: string | null) => String(dept || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
const getUserRoom = (userId: string) => `user:${userId}`;
const getRoleRoom = (role: "user" | "admin") => `role:${role}`;
const getStatusRoom = (status: "active" | "suspended") => `status:${status}`;
const getDeptRoom = (dept?: string | null) => `dept:${normalizeDept(dept)}`;

const addSocketForUser = (user: AuthenticatedSocketUser, socketId: string) => {
  socketUsers.set(socketId, user);
  const sockets = userSockets.get(user.id) ?? new Set<string>();
  sockets.add(socketId);
  userSockets.set(user.id, sockets);
};

const removeSocketForUser = (socketId: string) => {
  const user = socketUsers.get(socketId);
  if (!user) {
    return;
  }

  socketUsers.delete(socketId);
  const sockets = userSockets.get(user.id);
  if (!sockets) {
    return;
  }

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(user.id);
  }
};

const startSocketActivity = (socketId: string, activity?: string | null) => {
  const nextActivity = normalizeActivityName(activity);
  const activities = socketActivities.get(socketId) ?? new Set<string>();
  activities.add(nextActivity);
  socketActivities.set(socketId, activities);
};

const stopSocketActivity = (socketId: string, activity?: string | null) => {
  if (!socketActivities.has(socketId)) {
    return;
  }

  if (!activity) {
    socketActivities.delete(socketId);
    return;
  }

  const activities = socketActivities.get(socketId);
  if (!activities) {
    return;
  }

  activities.delete(normalizeActivityName(activity));
  if (activities.size === 0) {
    socketActivities.delete(socketId);
  }
};

const emitAdminRealtimeEvent = (resource: string, action: string, payload?: unknown) => {
  if (!io) {
    return;
  }

  io.to(getRoleRoom("admin")).emit("admin:event", {
    resource,
    action,
    payload,
    occurredAt: new Date().toISOString(),
  });
};

const emitRoomRealtimeEvent = (room: string, eventName: string, payload?: unknown) => {
  if (!io) {
    return;
  }

  io.to(room).emit(eventName, payload);
};

const emitBroadcastRealtimeEvent = (eventName: string, payload?: unknown) => {
  if (!io) {
    return;
  }

  io.emit(eventName, payload);
};

const emitRealtimeChange = (resource: string, action: string, eventName: string, payload?: unknown) => {
  const nextPayload: RealtimeActionPayload = {
    action,
    payload,
    occurredAt: new Date().toISOString(),
  };

  emitAdminRealtimeEvent(resource, action, payload);
  emitBroadcastRealtimeEvent(eventName, nextPayload);
};

export const getActiveParticipantIds = () => {
  const activeIds = new Set<string>();

  for (const [socketId, activities] of socketActivities.entries()) {
    if (activities.size === 0) {
      continue;
    }

    const user = socketUsers.get(socketId);
    if (user?.id) {
      activeIds.add(user.id);
    }
  }

  return activeIds;
};

export const getActiveParticipantModules = () => {
  const activityMap = new Map<string, Set<string>>();

  for (const [socketId, activities] of socketActivities.entries()) {
    if (activities.size === 0) {
      continue;
    }

    const user = socketUsers.get(socketId);
    if (!user) {
      continue;
    }

    const userActivities = activityMap.get(user.id) ?? new Set<string>();
    for (const activity of activities) {
      userActivities.add(activity);
    }
    activityMap.set(user.id, userActivities);
  }

  return Object.fromEntries(
    Array.from(activityMap.entries()).map(([userId, activities]) => [userId, Array.from(activities)]),
  ) as Record<string, string[]>;
};

export const emitLeaderboardSnapshot = async (target?: Socket) => {
  if (!io) {
    return;
  }

  try {
    const { getLeaderboardSnapshot } = await import("./userService");
    const snapshot = await getLeaderboardSnapshot();

    if (target) {
      target.emit("leaderboard:snapshot", snapshot);
      return;
    }

    io.emit("leaderboard:snapshot", snapshot);
    emitAdminRealtimeEvent("leaderboard", "snapshot", snapshot);
  } catch (error) {
    logger.warn("Failed to emit leaderboard snapshot", serializeError(error));
  }
};

export const emitTaskRealtimeEvent = (action: string, payload?: unknown) => {
  emitRealtimeChange("task", action, "tasks:changed", payload);
};

export const emitDailyTaskRealtimeEvent = (action: string, payload?: unknown) => {
  emitRealtimeChange("daily-task", action, "daily-tasks:changed", payload);
};

export const emitQuestionRealtimeEvent = (action: string, payload?: unknown) => {
  emitRealtimeChange("question", action, "questions:changed", payload);
};

export const emitVideoRealtimeEvent = (action: string, payload?: unknown) => {
  emitRealtimeChange("video", action, "videos:changed", payload);
};

export const emitFinalTestConfigRealtimeEvent = (action: string, payload?: unknown) => {
  emitRealtimeChange("final-test-config", action, "final-test-config:changed", payload);
};

export const emitFinalTestSubmissionRealtimeEvent = (action: string, payload?: unknown) => {
  emitRealtimeChange("final-test-submission", action, "final-test-submissions:changed", payload);
};

export const emitNotificationRealtimeEvent = (
  audience: NotificationAudience,
  payload?: unknown,
) => {
  if (!io) {
    return;
  }

  emitAdminRealtimeEvent("notification", "created", payload);

  switch (audience.scope) {
    case "users":
      emitRoomRealtimeEvent(getRoleRoom("user"), "notifications:new", payload);
      break;
    case "admins":
      emitRoomRealtimeEvent(getRoleRoom("admin"), "notifications:new", payload);
      break;
    case "dept":
      emitRoomRealtimeEvent(getDeptRoom(audience.dept), "notifications:new", payload);
      break;
    case "status":
      emitRoomRealtimeEvent(getStatusRoom(audience.status || "active"), "notifications:new", payload);
      break;
    case "all":
    default:
      emitBroadcastRealtimeEvent("notifications:new", payload);
      break;
  }
};

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173", "http://localhost:8080"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = getSocketToken(socket);
    if (!token || !process.env.JWT_SECRET) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id?: string; _id?: string };
      const userId = decoded.id || decoded._id;
      if (!userId) {
        next();
        return;
      }

      const user = await User.findById(userId).select("_id role status dept").lean();
      if (user) {
        socket.data.user = {
          id: user._id.toString(),
          role: user.role || "user",
          status: user.status || "active",
          dept: typeof user.dept === "string" ? user.dept : undefined,
        } satisfies AuthenticatedSocketUser;
      }
    } catch (error) {
      logger.warn("Socket authentication failed", serializeError(error));
    }

    next();
  });

  io.on("connection", (socket) => {
    const authenticatedUser = socket.data.user as AuthenticatedSocketUser | undefined;
    if (authenticatedUser?.id) {
      addSocketForUser(authenticatedUser, socket.id);
      socket.join(getUserRoom(authenticatedUser.id));
      socket.join(getRoleRoom(authenticatedUser.role));
      socket.join(getStatusRoom(authenticatedUser.status));
      if (normalizeDept(authenticatedUser.dept)) {
        socket.join(getDeptRoom(authenticatedUser.dept));
      }
    }

    logger.debug("Client connected", { socketId: socket.id });

    socket.on("leaderboard:subscribe", () => {
      void emitLeaderboardSnapshot(socket);
    });

    socket.on("leaderboard:activity:start", (payload?: { module?: string }) => {
      if (!authenticatedUser?.id) {
        return;
      }

      startSocketActivity(socket.id, payload?.module);
      void emitLeaderboardSnapshot();
    });

    socket.on("leaderboard:activity:stop", (payload?: { module?: string }) => {
      if (!authenticatedUser?.id) {
        return;
      }

      stopSocketActivity(socket.id, payload?.module);
      void emitLeaderboardSnapshot();
    });

    socket.on("disconnect", () => {
      stopSocketActivity(socket.id);
      removeSocketForUser(socket.id);
      logger.debug("Client disconnected", { socketId: socket.id });
      void emitLeaderboardSnapshot();
    });
  });

  return io;
};

export const getIO = (): SocketTransport => {
  if (!io) {
    logger.warn("Socket.io not initialized. Returning mock transport.");
    return {
      emit: () => {},
      on: () => {},
      off: () => {},
      to: () => ({ emit: () => {} }),
      in: () => ({ emit: () => {} }),
    };
  }
  return io;
};
