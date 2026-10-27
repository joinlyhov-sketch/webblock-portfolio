import type { ReactNode } from "react";
import { CloseCircle, Edit2, Global, InfoCircle, PauseCircle, TickCircle } from "iconsax-reactjs";
import type { OrderStatus } from "@/features/account";
import type { WebsiteStatus } from "@/features/websites";
import { cn } from "@/lib/utils";

/** `UNSAVED`: the editor has changes that are not saved as a draft yet. */
export type BadgeStatus = WebsiteStatus | OrderStatus | "UNSAVED";

type StatusMeta = { label: string; icon: ReactNode; className: string };

const statusMeta = {
  LIVE: { label: "Live", icon: <Global />, className: "bg-success-soft text-success" },
  DRAFT: { label: "Draft", icon: <Edit2 />, className: "bg-status-draft-soft text-foreground-soft" },
  SUSPENDED: {
    label: "Suspended",
    icon: <PauseCircle />,
    className: "bg-status-suspended-soft text-status-suspended",
  },
  PAID: { label: "Paid", icon: <TickCircle />, className: "bg-success-soft text-success" },
  EXPIRED: { label: "Expired", icon: <CloseCircle />, className: "bg-danger-soft text-danger" },
  UNSAVED: { label: "Unsaved changes", icon: <InfoCircle />, className: "bg-warning-soft text-warning" },
} satisfies Record<BadgeStatus, StatusMeta>;

/** Every status in the app: light tint pill with an icon (Figma "Status badge"). */
export function StatusBadge({ status, className }: { status: BadgeStatus; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-[5px] rounded-full px-2 text-xs leading-[18px] font-medium whitespace-nowrap shadow-button [&_svg]:size-3.5",
        meta.className,
        className,
      )}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}
