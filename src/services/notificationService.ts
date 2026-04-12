import { apiClient } from "@services/apiClient";
import type { AdminNotificationRecord } from "@services/adminService";

export type UserNotificationRecord = AdminNotificationRecord & {
  isRead: boolean;
  readAt?: string;
};

type UserNotificationsEnvelope = {
  items: UserNotificationRecord[];
  unreadCount: number;
};

type DataResponse<T> = {
  success: boolean;
  data: T;
};

export const notificationService = {
  listNotifications(params?: { limit?: number; unreadOnly?: boolean }): Promise<DataResponse<UserNotificationsEnvelope>> {
    const query = new URLSearchParams();
    if (params?.limit) {
      query.set("limit", String(params.limit));
    }
    if (params?.unreadOnly) {
      query.set("unreadOnly", "true");
    }

    return apiClient<DataResponse<UserNotificationsEnvelope>>(`/notifications${query.size ? `?${query.toString()}` : ""}`);
  },

  markRead(notificationId: string): Promise<DataResponse<UserNotificationRecord>> {
    return apiClient<DataResponse<UserNotificationRecord>>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },
};
