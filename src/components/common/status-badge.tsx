import type { ComponentType } from "react";
import {
  Danger,
  Edit2,
  Forbidden2,
  Global,
  Refresh2,
  Send2,
  TickCircle,
  Timer1,
  Clock,
  Wallet2,
} from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Every status the platform shows. Same names as the API enums, so a feature passes its
 * entity's status straight through: `<StatusBadge status={website.siteStatus} />`.
 */
export type Status =
  // Accounts and subscriptions
  | "ACTIVE"
  | "SUSPENDED"
  | "PENDING"
  | "CANCELED"
  | "EXPIRED"
  // Website hosting
  | "ONLINE"
  | "NOT_DEPLOYED"
  | "OFFLINE_BILLING"
  // Releases and deploys
  | "LIVE"
  | "GOING_LIVE"
  | "FAILED"
  // Routing
  | "UPDATING"
  // Payments
  | "PAID";

type Tone = "success" | "danger" | "info" | "warning" | "neutral";

type StatusMeta = {
  label: string;
  tone: Tone;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const STATUS = {
  ACTIVE: { label: "Active", tone: "success", icon: TickCircle },
  SUSPENDED: { label: "Suspended", tone: "danger", icon: Forbidden2 },
  PENDING: { label: "Pending", tone: "warning", icon: Clock },
  CANCELED: { label: "Canceled", tone: "danger", icon: Forbidden2 },
  EXPIRED: { label: "Expired", tone: "danger", icon: Timer1 },
  ONLINE: { label: "Online", tone: "success", icon: Global },
  NOT_DEPLOYED: { label: "Not deployed", tone: "info", icon: Edit2 },
  OFFLINE_BILLING: { label: "Offline · billing", tone: "danger", icon: Timer1 },
  LIVE: { label: "Live", tone: "success", icon: Global },
  GOING_LIVE: { label: "Going live", tone: "info", icon: Send2 },
  FAILED: { label: "Failed", tone: "danger", icon: Danger },
  UPDATING: { label: "Updating", tone: "info", icon: Refresh2 },
  PAID: { label: "Paid", tone: "success", icon: Wallet2 },
} satisfies Record<Status, StatusMeta>;

const TONE = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-neutral-soft text-muted-foreground",
} satisfies Record<Tone, string>;

/** Pill with a light tint and an icon per status (Figma "Status badge"). */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const meta: StatusMeta = STATUS[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-[5px] rounded-full px-2 text-xs font-medium whitespace-nowrap shadow-button",
        TONE[meta.tone],
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {meta.label}
    </span>
  );
}

/** Plain-text label for a status, e.g. in detail lists. */
export function statusLabel(status: Status): string {
  return STATUS[status].label;
}
