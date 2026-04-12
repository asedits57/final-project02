import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let activeToken: string | null = null;
let socketLeaseCount = 0;

const getSocketBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (configuredUrl) {
    return configuredUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl && /^https?:\/\//.test(apiUrl)) {
    return apiUrl.replace(/\/api\/v1\/?$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

const getOrCreateSocket = (token?: string | null) => {
  const nextToken = token?.trim() || null;
  if (!nextToken) {
    return null;
  }

  if (!socket || activeToken !== nextToken) {
    socket?.disconnect();
    activeToken = nextToken;
    socket = io(getSocketBaseUrl(), {
      autoConnect: false,
      auth: { token: nextToken },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getRealtimeSocket = (token?: string | null) => getOrCreateSocket(token);

export const acquireRealtimeSocket = (token?: string | null) => {
  const nextSocket = getOrCreateSocket(token);
  if (nextSocket) {
    socketLeaseCount += 1;
  }
  return nextSocket;
};

export const releaseRealtimeSocket = () => {
  socketLeaseCount = Math.max(0, socketLeaseCount - 1);
  if (socketLeaseCount > 0) {
    return;
  }

  socket?.disconnect();
  socket = null;
  activeToken = null;
};

export const disconnectRealtimeSocket = () => {
  socketLeaseCount = 0;
  releaseRealtimeSocket();
};
