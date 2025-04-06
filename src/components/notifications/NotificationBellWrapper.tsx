import { Suspense } from "react";
import { NotificationBell } from "./NotificationsBell";

export function NotificationBellWrapper() {
  return (
    <Suspense fallback={<div className="w-9 h-9" />}>
      <NotificationBell />
    </Suspense>
  );
}
