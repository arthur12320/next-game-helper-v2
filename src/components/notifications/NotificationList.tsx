"use client";

import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
} from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Notification } from "@/db/schema/notifications";
import { ArrowRight, Bell, Check } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  onAllRead: () => void;
  onNotificationRead: (newCount: number) => void;
  setPopoverOpen: (open: boolean) => void;
}

export function NotificationList({
  onAllRead,
  onNotificationRead,
  setPopoverOpen,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      onAllRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleNotificationRead = async () => {
    try {
      const count = await getUnreadNotificationCount();
      onNotificationRead(count);
    } catch (error) {
      console.error("Failed to update notification count:", error);
    }
  };

  const handleNotificationAction = (
    notification: Notification,
    data?: string
  ) => {
    console.log("data", data);
    // console.log("notificationId", notificationId);
    if (notification.type === "invite") {
      redirect("/campaigns/invites");
    }
  };

  return (
    <div className="w-auto">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-medium">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some((n) => !n.isRead)}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>
      <Separator />
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Bell className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <h3 className="mb-1 font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            {"You're all caught up!"}
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[300px] w-full">
            <div className="w-full flex flex-col">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleNotificationRead}
                  onAction={handleNotificationAction}
                />
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => {
                setPopoverOpen(false);
                // Navigate to notifications page if you have one
                // window.location.href = "/notifications";
              }}
            >
              View all notifications
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
