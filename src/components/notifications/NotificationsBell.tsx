"use client";

import { getUnreadNotificationCount } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react"; // Import useSession
import { useEffect, useRef, useState } from "react";
import { NotificationList } from "./NotificationList";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { status } = useSession(); // Add session check
  const intervalIdRef = useRef<number | null>(null);

  // Fetch unread count on initial load
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    // Only fetch if authenticated
    if (status === "authenticated") {
      fetchUnreadCount();
    }
  }, [status]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    if (status === "authenticated") {
      // Set up polling for new notifications (every 30 seconds)
      intervalIdRef.current = window.setInterval(fetchUnreadCount, 30000);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [status]);

  // Update unread count when notifications are read
  const handleNotificationsRead = () => {
    setUnreadCount(0);
  };

  // Update unread count when a notification is read
  const handleNotificationRead = (newCount: number) => {
    setUnreadCount(newCount);
  };

  // Don't render anything if not authenticated
  if (status !== "authenticated") {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <NotificationList
          onAllRead={handleNotificationsRead}
          onNotificationRead={handleNotificationRead}
          setPopoverOpen={setOpen}
        />
      </PopoverContent>
    </Popover>
  );
}
