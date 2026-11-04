"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Add, Notification, NotificationBing, TickCircle } from "iconsax-reactjs";
import { EmptyState } from "@/components/common/empty-state";
import { HeroDecor } from "@/components/common/hero-decor";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** One row of the notification list, already shaped by the feature that owns the data. */
export type NotificationEntry = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  /** ISO-8601, for `<time dateTime>`. */
  createdAt: string;
  /** "2 mins ago". */
  timeLabel: string;
  /** Where the notification points. Opening a row only shows its detail popup; it does not navigate. */
  href?: string | null;
  /** Round 40px picture on the left (avatar, screenshot or tinted circle). */
  avatar: ReactNode;
};

export type NotificationsState = ReturnType<typeof useNotifications>;

/**
 * Read state of a notification list. Rows are marked read on screen straight away, then the
 * feature's action runs; the server copy catches up on the next render.
 */
export function useNotifications(
  entries: NotificationEntry[],
  actions: { markAll: () => Promise<void>; markRead?: (id: string) => Promise<void> },
) {
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());
  const [, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = entries.map((n) => (n.read || readIds.has(n.id) ? { ...n, read: true } : n));
  const unread = items.filter((n) => !n.read).length;

  function markAll() {
    setReadIds(new Set(entries.map((n) => n.id)));
    startTransition(actions.markAll);
  }

  /** Opens the detail popup for a row and marks it read. */
  function open(entry: NotificationEntry) {
    setSelectedId(entry.id);
    if (entry.read) return;
    setReadIds((current) => new Set(current).add(entry.id));
    const markRead = actions.markRead;
    if (markRead) startTransition(() => markRead(entry.id));
  }

  const selected = items.find((n) => n.id === selectedId) ?? null;

  return { items, unread, markAll, open, selected, closeDetail: () => setSelectedId(null) };
}

/** Popup with the whole notification: sender, full time, the full message and a link when there is one. */
export function NotificationDetailModal({ state }: { state: NotificationsState }) {
  const { selected, closeDetail } = state;
  return (
    // Same card as the account "Plan details" dialog.
    <Modal open={selected !== null} onClose={closeDetail} label="Notification details" className="max-w-[520px] rounded-[18px] shadow-dialog">
      {selected && (
        <div className="relative isolate flex flex-col gap-5 overflow-hidden px-7 pt-7 pb-7">
          <HeroDecor layout="card" behindPicture={false} />
          <div className="flex items-center gap-3.5">
            <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full">{selected.avatar}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pr-10">
              <h2 className="text-xl font-semibold break-words">{selected.title}</h2>
              <time dateTime={selected.createdAt} suppressHydrationWarning className="text-[13px] text-muted-foreground">
                {formatDateTime(selected.createdAt)} · {selected.timeLabel}
              </time>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={closeDetail}
              className="absolute top-4 right-4 flex size-[34px] items-center justify-center rounded-[10px] bg-panel text-muted-foreground outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <Add variant="Outline" aria-hidden className="size-[18px] rotate-45" />
            </button>
          </div>
          <hr className="border-border" />

          <p className="text-sm leading-6 break-words whitespace-pre-line text-foreground-soft">
            {selected.message}
          </p>
        </div>
      )}
    </Modal>
  );
}

/** Header bell: a dot and a gentle swing while anything is unread; opens the list in a popover. */
export function NotificationBell({ state, className }: { state: NotificationsState; className?: string }) {
  const [open, setOpen] = useState(false);
  const { unread } = state;

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon-lg"
          className={cn("relative", className)}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Notification variant="Outline" className={cn("origin-[50%_8%]", unread > 0 && "motion-safe:animate-bell-ring")} />
          {unread > 0 && (
            <span aria-hidden className="absolute top-2 right-2.5 grid size-2">
              <span className="absolute inset-0 rounded-full bg-primary motion-safe:animate-dot-ping" />
              <span className="relative size-2 rounded-full bg-primary ring-2 ring-background" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(400px,calc(100vw-32px))] overflow-hidden rounded-3xl p-0 shadow-notifications"
      >
        <NotificationList state={state} onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
    {/* Outside the popover so the detail stays open after the list closes. */}
    <NotificationDetailModal state={state} />
    </>
  );
}

type Tab = "all" | "unread";

/**
 * Notification list (bell popover or a full page): title, "Mark all as read", All / Unread tabs,
 * rows with avatar, unread rows tinted with a blue dot. Opening a row marks it read.
 */
export function NotificationList({
  state,
  variant = "popover",
  onNavigate,
}: {
  state: NotificationsState;
  variant?: "popover" | "page";
  /** Called when a row is opened (the popover closes itself). */
  onNavigate?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const { items, unread, markAll, open } = state;
  const shown = tab === "unread" ? items.filter((n) => !n.read) : items;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-2.5">
        {variant === "popover" ? <h2 className="text-[19px] font-semibold text-foreground">Notifications</h2> : <span />}
        <button
          type="button"
          onClick={markAll}
          disabled={unread === 0}
          className="rounded-md text-[13px] font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:text-placeholder"
        >
          Mark all as read
        </button>
      </div>

      <div role="tablist" aria-label="Filter notifications" className="flex gap-6 border-b border-border px-5">
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
        aria-label={tab === "unread" ? "Unread notifications" : "All notifications"}
        className={cn("divide-y divide-border overflow-y-auto", variant === "popover" && "max-h-[408px]")}
      >
        {shown.length === 0 && (
          <li className="px-5 py-4">
            {tab === "unread" ? (
              <EmptyState icon={<TickCircle variant="Outline" />} title="You're all caught up" description="New activity will show here." />
            ) : (
              <EmptyState icon={<NotificationBing variant="Outline" />} title="No notifications yet" />
            )}
          </li>
        )}
        {shown.map((n, index) => {
          const row = (
            <>
              <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full">
                {n.avatar}
              </span>
              <span className="min-w-0 flex-1">
                <span title={n.title} className="block truncate text-sm font-semibold text-foreground">{n.title}</span>
                <span title={n.message} className="block truncate text-[13px] text-muted-foreground">{n.message}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5 self-stretch py-0.5">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", n.read ? "bg-transparent" : "bg-primary motion-safe:animate-pulse")}
                />
                <time dateTime={n.createdAt} suppressHydrationWarning className="text-xs text-placeholder">
                  {n.timeLabel}
                </time>
              </span>
              {!n.read && <span className="sr-only">(unread)</span>}
            </>
          );
          const className = cn(
            "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
            !n.read && "bg-primary-soft/70",
          );
          // Opening a row shows its detail popup (the bell popover closes first); the popup holds the link.
          const onClick = () => {
            onNavigate?.();
            open(n);
          };
          return (
            // Rows slide in one after another when the panel opens or the tab changes.
            <li key={n.id} className="motion-safe:animate-row-in" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
              <button type="button" aria-haspopup="dialog" onClick={onClick} className={className}>
                {row}
              </button>
            </li>
          );
        })}
      </ul>
      {variant === "page" && <NotificationDetailModal state={state} />}
    </div>
  );
}
