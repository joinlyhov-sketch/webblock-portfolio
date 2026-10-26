import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "brand" | "neutral";

/** What a feature's status map gives each status: `satisfies Record<Status, StatusMeta>`. */
export type StatusMeta = {
  label: string;
  tone: StatusTone;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const TONE = {
  success: "bg-success-soft text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand-soft text-brand-strong",
  neutral: "bg-segment text-foreground-soft",
} satisfies Record<StatusTone, string>;

/**
 * Every status pill: light tint, icon (or dot), normal case, no border.
 *
 * @example
 * const WEBSITE_STATUS = { LIVE: { label: "Live", tone: "success" }, … } satisfies Record<WebsiteStatus, StatusMeta>;
 * <StatusBadge {...WEBSITE_STATUS[website.status]} />
 */
export function StatusBadge({
  label,
  tone,
  icon: Icon,
  className,
  children,
}: StatusMeta & { className?: string; children?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {Icon ? <Icon aria-hidden className="size-3.5" /> : <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children ?? label}
    </span>
  );
}
