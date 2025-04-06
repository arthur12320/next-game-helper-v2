"use client";

import { markNotificationAsRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { Notification } from "@/db/schema/notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onAction: (notification: Notification, data?: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onAction,
}: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!notification.isRead) {
      setIsLoading(true);
      try {
        await markNotificationAsRead(notification.id);
        onRead();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      } finally {
        setIsLoading(false);
      }
    }

    onAction(notification, notification.data as string);
  };

  // Format the time
  const timeAgo = formatDistanceToNow(notification.createdAt as Date);

  return (
    <Button
      variant="ghost"
      className={cn(
        " w-full cursor-pointer items-start gap-3 rounded-none p-4 text-left text-wrap h-auto"
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      <div className="flex-1 space-y-1">
        <p
          className={cn(
            "text-sm ",
            !notification.isRead && "font-medium ",
            !!notification.isRead && "text-muted-foreground"
          )}
        >
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
      {!notification.isRead && (
        <div className="h-2 w-2 mt-4 rounded-full bg-blue-500"></div>
      )}
    </Button>
  );
}
