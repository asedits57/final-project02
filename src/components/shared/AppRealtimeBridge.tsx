import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { acquireRealtimeSocket, releaseRealtimeSocket } from "@lib/socket";
import useDeferredMount from "@hooks/useDeferredMount";
import { getAccessToken } from "@services/apiClient";
import { useAuthStore } from "@store/useAuthStore";

const emitWindowEvent = (eventName: string, detail?: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const AppRealtimeBridge = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const shouldConnect = useDeferredMount({ delayMs: 400, timeoutMs: 1500 });

  useEffect(() => {
    if (!shouldConnect) {
      return;
    }

    const token = getAccessToken();
    if (!token || !user) {
      return;
    }

    const socket = acquireRealtimeSocket(token);
    if (!socket) {
      return;
    }

    const handleQuestionsChanged = (payload: unknown) => {
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      emitWindowEvent("app:questions-changed", payload);
    };
    const handleTasksChanged = (payload: unknown) => emitWindowEvent("app:tasks-changed", payload);
    const handleVideosChanged = (payload: unknown) => emitWindowEvent("app:videos-changed", payload);
    const handleDailyTasksChanged = (payload: unknown) => emitWindowEvent("app:daily-tasks-changed", payload);
    const handleFinalTestConfigChanged = (payload: unknown) => emitWindowEvent("app:final-test-config-changed", payload);
    const handleAdminEvent = (payload: unknown) => emitWindowEvent("app:admin-event", payload);

    socket.on("questions:changed", handleQuestionsChanged);
    socket.on("tasks:changed", handleTasksChanged);
    socket.on("videos:changed", handleVideosChanged);
    socket.on("daily-tasks:changed", handleDailyTasksChanged);
    socket.on("final-test-config:changed", handleFinalTestConfigChanged);
    socket.on("admin:event", handleAdminEvent);

    return () => {
      socket.off("questions:changed", handleQuestionsChanged);
      socket.off("tasks:changed", handleTasksChanged);
      socket.off("videos:changed", handleVideosChanged);
      socket.off("daily-tasks:changed", handleDailyTasksChanged);
      socket.off("final-test-config:changed", handleFinalTestConfigChanged);
      socket.off("admin:event", handleAdminEvent);
      releaseRealtimeSocket();
    };
  }, [queryClient, shouldConnect, user]);

  return null;
};

export default AppRealtimeBridge;
