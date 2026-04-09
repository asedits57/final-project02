import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let activeToken: string | null = null;

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

export const getRealtimeSocket = (token?: string | null) => {
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

export const disconnectRealtimeSocket = () => {
  socket?.disconnect();
  socket = null;
  activeToken = null;
};
