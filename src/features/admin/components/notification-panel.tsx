"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { NotificationBing, TickCircle } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { EmptyState } from "@/components/common/empty-state";
import { toast } from "@/components/common/toast";
import { formatTimeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../actions";
import type { AdminNotification, NotificationKind } from "../types";

/** Colour of the small dot on the avatar: red = broken, amber = money/time running out, blue = activity. */
const KIND_DOT = {
  DEPLOY_FAILED: "bg-danger",
  PLAN_EXPIRED: "bg-danger",
  PAYMENT_PAST_DUE: "bg-warning",
  TRIAL_ENDING: "bg-warning",
  TRIAL_STARTED: "bg-primary",
  REDEPLOY_REQUESTED: "bg-primary",
  ACCOUNT_CREATED: "bg-primary",
  PLAN_UPGRADED: "bg-success",
} satisfies Record<NotificationKind, string>;

type Tab = "all" | "unread";

/**
 * Admin notifications list (bell popover and /admin/notifications): title, "Mark all as read",
 * All / Unread tabs, rows with avatar + event dot, unread rows tinted with a blue dot.
 * Opening a row marks it read.
 */
export function NotificationPanel({
  notifications,
  variant = "popover",
  onNavigate,
}: {
  notifications: AdminNotification[];
  variant?: "popover" | "page";
  /** Called when a row is opened (the popover closes itself). */
  onNavigate?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [, startTransition] = useTransition();
  const [items, markRead] = useOptimistic(
    notifications,
    (current, id: string | "all") =>
      current.map((n) =>
        n.readAt === null && (id === "all" || n.id === id)
          ? { ...n, readAt: "now" }
          : n,
      ),
  );

  const unread = items.filter((n) => n.readAt === null).length;
  const shown =
    tab === "unread" ? items.filter((n) => n.readAt === null) : items;

  function open(n: AdminNotification) {
    onNavigate?.();
    if (n.readAt !== null) return;
    startTransition(async () => {
      markRead(n.id);
      await markNotificationReadAction(n.id);
    });
  }

  function markAll() {
    startTransition(async () => {
      markRead("all");
      const result = await markAllNotificationsReadAction();
      if (!result.ok) toast.error("Couldn't mark as read", result.message);
    });
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-2.5">
        {variant === "popover" ? (
          <h2 className="text-[19px] font-semibold text-foreground">
            Notifications
          </h2>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={markAll}
          disabled={unread === 0}
          className="rounded-md text-[13px] font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:text-placeholder"
        >
          Mark all as read
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Filter notifications"
        className="flex gap-6 border-b border-border px-5"
      >
        {(
          [
            ["all", "All notifications"],
            ["unread", "Unread"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 pb-2 text-sm outline-none focus-visible:text-foreground",
              tab === value
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {value === "unread" && unread > 0 && (
              <span className="grid h-4 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <ul
        role="tabpanel"
        aria-label={
          tab === "unread" ? "Unread notifications" : "All notifications"
        }
        className={cn(
          "divide-y divide-border overflow-y-auto",
          variant === "popover" && "max-h-[408px]",
        )}
      >
        {shown.length === 0 && (
          <li className="px-5 py-4">
            {tab === "unread" ? (
              <EmptyState
                icon={<TickCircle />}
                title="You're all caught up"
                description="New activity will show here."
              />
            ) : (
              <EmptyState
                icon={<NotificationBing />}
                title="No notifications yet"
              />
            )}
          </li>
        )}
        {shown.map((n) => {
          const isUnread = n.readAt === null;
          const row = (
            <>
              <span className="relative shrink-0">
                <Avatar
                  name={n.actorName}
                  src={n.actorAvatarUrl}
                  className="size-10 text-xs ring-0"
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
                    KIND_DOT[n.kind],
                  )}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {n.actorName}
                </span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {n.message}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5 self-stretch py-0.5">
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    isUnread ? "bg-primary" : "bg-transparent",
                  )}
                />
                <time
                  dateTime={n.createdAt}
                  suppressHydrationWarning
                  className="text-xs text-placeholder"
                >
                  {formatTimeAgo(n.createdAt)}
                </time>
              </span>
              {isUnread && <span className="sr-only">(unread)</span>}
            </>
          );
          const className = cn(
            "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
            isUnread && "bg-primary-soft/70",
          );
          return (
            <li key={n.id}>
              {n.link ? (
                <Link
                  href={n.link}
                  scroll={false}
                  onClick={() => open(n)}
                  className={className}
                >
                  {row}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={className}
                >
                  {row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
