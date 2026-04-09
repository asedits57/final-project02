import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import User from "../models/User";

let io: Server;

type AuthenticatedSocketUser = {
  id: string;
};

const socketUsers = new Map<string, string>();
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

const addSocketForUser = (userId: string, socketId: string) => {
  socketUsers.set(socketId, userId);
  const sockets = userSockets.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  userSockets.set(userId, sockets);
};

const removeSocketForUser = (socketId: string) => {
  const userId = socketUsers.get(socketId);
  if (!userId) {
    return;
  }

  socketUsers.delete(socketId);
  const sockets = userSockets.get(userId);
  if (!sockets) {
    return;
  }

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
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

export const getActiveParticipantIds = () => {
  const activeIds = new Set<string>();

  for (const [socketId, activities] of socketActivities.entries()) {
    if (activities.size === 0) {
      continue;
    }

    const userId = socketUsers.get(socketId);
    if (userId) {
      activeIds.add(userId);
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

    const userId = socketUsers.get(socketId);
    if (!userId) {
      continue;
    }

    const userActivities = activityMap.get(userId) ?? new Set<string>();
    for (const activity of activities) {
      userActivities.add(activity);
    }
    activityMap.set(userId, userActivities);
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
  } catch (error) {
    console.warn("Failed to emit leaderboard snapshot:", error);
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

      const user = await User.findById(userId).select("_id");
      if (user) {
        socket.data.user = { id: user._id.toString() } satisfies AuthenticatedSocketUser;
      }
    } catch (error) {
      console.warn("Socket authentication failed:", error);
    }

    next();
  });

  io.on("connection", (socket) => {
    const authenticatedUser = socket.data.user as AuthenticatedSocketUser | undefined;
    if (authenticatedUser?.id) {
      addSocketForUser(authenticatedUser.id, socket.id);
    }

    console.log("Client connected:", socket.id);

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
      console.log("Client disconnected:", socket.id);
      void emitLeaderboardSnapshot();
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not initialized. Returning mock for safety.");
    return {
      emit: () => {},
      on: () => {},
      off: () => {},
      to: () => ({ emit: () => {} }),
      in: () => ({ emit: () => {} }),
    } as any;
  }
  return io;
};
