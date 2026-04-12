import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { acquireRealtimeSocket, releaseRealtimeSocket } from "@lib/socket";
import { getAccessToken } from "@services/apiClient";
import { notificationService, type UserNotificationRecord } from "@services/notificationService";
import { Button } from "@components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { ScrollArea } from "@components/ui/scroll-area";
import { Badge } from "@components/ui/badge";
import { brand } from "@lib/brand";

const typeTone: Record<UserNotificationRecord["type"], string> = {
  info: "border-sky-400/25 bg-sky-500/12 text-sky-100",
  success: "border-emerald-400/25 bg-emerald-500/12 text-emerald-100",
  warning: "border-amber-400/25 bg-amber-500/12 text-amber-100",
  critical: "border-rose-400/25 bg-rose-500/12 text-rose-100",
};

const byNewest = (left: UserNotificationRecord, right: UserNotificationRecord) => (
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
);

const upsertNotification = (current: UserNotificationRecord[], incoming: UserNotificationRecord) => {
  const next = current.filter((item) => item._id !== incoming._id);
  next.unshift(incoming);
  return next.sort(byNewest);
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<UserNotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.listNotifications({ limit: 20 });
      setNotifications(response.data.items.sort(byNewest));
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Notification load failed:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const socket = acquireRealtimeSocket(token);
    if (!socket) {
      return;
    }

    const handleIncomingNotification = (notification: UserNotificationRecord) => {
      setNotifications((current) => upsertNotification(current, {
        ...notification,
        isRead: false,
      }));
      setUnreadCount((current) => current + 1);
    };

    socket.on("notifications:new", handleIncomingNotification);

    return () => {
      socket.off("notifications:new", handleIncomingNotification);
      releaseRealtimeSocket();
    };
  }, []);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 20),
    [notifications],
  );

  const markReadAndNavigate = async (notification: UserNotificationRecord) => {
    try {
      if (!notification.isRead) {
        setBusyId(notification._id);
        const response = await notificationService.markRead(notification._id);
        setNotifications((current) => current.map((item) => (
          item._id === notification._id ? response.data : item
        )));
        setUnreadCount((current) => Math.max(0, current - 1));
      }

      if (notification.actionLink) {
        setOpen(false);
        navigate(notification.actionLink);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="relative h-10 rounded-full border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
        >
          <Bell className="mr-2 h-4 w-4 text-cyan-200" />
          Alerts
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-[1.3rem] items-center justify-center rounded-full bg-orange-400 px-1.5 py-0.5 text-[10px] font-semibold text-slate-950">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,430px)] rounded-3xl border-white/10 bg-[#0c1524] p-0 text-slate-100">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Notifications</p>
            <p className="text-xs text-slate-400">Live updates from {brand.shortName} operations and your workspace</p>
          </div>
          {unreadCount > 0 ? (
            <Badge className="border-orange-300/20 bg-orange-500/12 text-orange-100">
              {unreadCount} unread
            </Badge>
          ) : null}
        </div>
        <ScrollArea className="max-h-[28rem] px-3 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center text-sm text-slate-400">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleNotifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => void markReadAndNavigate(notification)}
                  className={`w-full rounded-3xl border p-4 text-left transition hover:bg-white/[0.05] ${
                    notification.isRead
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-cyan-400/20 bg-cyan-500/[0.08]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <Badge className={typeTone[notification.type]}>{notification.type}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{notification.message}</p>
                    </div>
                    {busyId === notification._id ? (
                      <Loader2 className="mt-1 h-4 w-4 animate-spin text-slate-400" />
                    ) : notification.actionLink ? (
                      <ChevronRight className="mt-1 h-4 w-4 text-slate-400" />
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {!notification.isRead ? <span className="text-cyan-200">Unread</span> : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
