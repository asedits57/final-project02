import { useEffect } from "react";
import { getAccessToken } from "@services/apiClient";
import { disconnectRealtimeSocket, getRealtimeSocket } from "@lib/socket";

export const useLiveModuleActivity = (moduleName: string) => {
  useEffect(() => {
    const token = getAccessToken();
    const socket = getRealtimeSocket(token);
    if (!socket) {
      return;
    }

    const startActivity = () => {
      socket.emit("leaderboard:activity:start", { module: moduleName });
    };

    const stopActivity = () => {
      socket.emit("leaderboard:activity:stop", { module: moduleName });
    };

    if (socket.connected) {
      startActivity();
    } else {
      socket.on("connect", startActivity);
    }

    window.addEventListener("beforeunload", stopActivity);

    return () => {
      window.removeEventListener("beforeunload", stopActivity);
      socket.off("connect", startActivity);
      stopActivity();
      disconnectRealtimeSocket();
    };
  }, [moduleName]);
};
