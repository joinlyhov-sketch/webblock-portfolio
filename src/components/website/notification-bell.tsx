"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Notification } from "iconsax-reactjs";
import { markAllNotificationsReadAction } from "@/actions/notification-actions";
import { Popover } from "@/components/common/popover";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/types/notification";

export type NotificationItem = AppNotification & {
  /** "2 mins ago", formatted on the server so the text is the same everywhere. */
  timeLabel: string;
};

const dotColor: Record<NotificationKind, string> = {
  SUCCESS: "bg-success",
  WARNING: "bg-notice-warning",
  INFO: "bg-primary",
};

const plainAvatar: Record<NotificationKind, string> = {
  SUCCESS: "bg-brand-soft",
  WARNING: "bg-notice-warning-soft",
  INFO: "bg-brand-soft",
};

/** Bell with a panel of notifications: All / Unread tabs and "Mark all as read". */
export function NotificationBell({ items: initial }: { items: NotificationItem[] }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [, startTransition] = useTransition();

  const unread = items.filter((n) => !n.read);
  const shown = tab === "unread" ? unread : items;

  function markAll() {
    setItems((current) => current.map((n) => ({ ...n, read: true })));
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  }

  return (
    <Popover
      label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
      trigger={
        <>
          <Notification aria-hidden className="size-5" />
          {unread.length > 0 && (
            <span
              aria-hidden
              className="absolute top-[8.25px] left-[22.25px] size-[8.5px] rounded-full bg-brand ring-[1.5px] ring-background"
            />
          )}
        </>
      }
      triggerClassName="relative size-10 border border-border bg-background text-foreground-soft transition-colors hover:bg-primary-soft"
      panelClassName="w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border-notice-border shadow-notifications"
    >
      {() => (
        <div>
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button
              type="button"
              onClick={markAll}
              disabled={unread.length === 0}
              className="text-[13px] font-medium text-primary outline-none hover:underline focus-visible:underline disabled:text-placeholder disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Filter notifications"
            className="flex items-end gap-5 border-b border-notice-border px-5 pt-1"
          >
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>
              All notifications
            </TabButton>
            <TabButton active={tab === "unread"} onClick={() => setTab("unread")}>
              Unread
              {unread.length > 0 && (
                <span className="inline-flex items-start rounded-full bg-primary px-[7px] py-px text-[11px] font-semibold text-primary-foreground">
                  {unread.length}
                </span>
              )}
            </TabButton>
          </div>

          <ul className="h-[378px] overflow-y-auto">
            {shown.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">You’re all caught up.</li>
            )}
            {shown.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex h-[63px] items-center gap-3 border-b border-segment-track px-5 py-3",
                  !n.read ? "bg-notice-unread" : "bg-background",
                )}
              >
                <span className="relative size-[38px] shrink-0">
                  <span className={cn("relative block size-[38px] overflow-hidden rounded-full", plainAvatar[n.kind])}>
                    {n.imageUrl && (
                      <Image src={n.imageUrl} alt="" fill unoptimized sizes="38px" className="object-cover object-top" />
                    )}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -right-px -bottom-px size-3 rounded-full border-2 border-background",
                      dotColor[n.kind],
                    )}
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                  <p className={cn("truncate text-sm text-foreground", n.read ? "font-medium" : "font-semibold")}>
                    {n.title}
                  </p>
                  <p className={cn("truncate text-[13px]", n.read ? "text-placeholder" : "text-muted-foreground")}>
                    {n.message}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    aria-label={n.read ? undefined : "Unread"}
                    aria-hidden={n.read || undefined}
                    className={cn("size-2 rounded-full bg-primary", n.read && "opacity-0")}
                  />
                  <span className="text-xs text-placeholder">{n.timeLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Popover>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center gap-1.5 border-b-2 px-0.5 py-2 text-sm outline-none transition-colors focus-visible:text-primary",
        active
          ? "border-primary font-semibold text-primary"
          : "border-transparent font-medium text-placeholder hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
