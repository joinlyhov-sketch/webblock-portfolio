"use client";

import { useState } from "react";
import { Notification } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AdminNotification } from "../types";
import { NotificationPanel } from "./notification-panel";

/** Header bell (Figma "Header · Notification bell"): red dot while anything is unread, opens the panel. */
export function NotificationsBell({
  notifications,
  unreadCount,
}: {
  notifications: AdminNotification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon-lg"
          className="ml-2"
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          {/* Swings from its top every few seconds while something is unread. */}
          <Notification
            className={cn(
              "origin-[50%_8%]",
              unreadCount > 0 && "motion-safe:animate-bell-ring",
            )}
          />
          {unreadCount > 0 && (
            <span aria-hidden className="absolute top-2 right-2.5 grid size-2">
              <span className="absolute inset-0 rounded-full bg-primary motion-safe:animate-dot-ping" />
              <span className="relative size-2 rounded-full bg-primary ring-2 ring-background" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(400px,calc(100vw-32px))] rounded-[22px]">
        <NotificationPanel
          notifications={notifications}
          onNavigate={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
