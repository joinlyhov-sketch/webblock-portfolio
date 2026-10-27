import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type KpiTone =
  "brand" | "teal" | "success" | "danger" | "violet" | "warning";

const TONE = {
  brand: {
    hover: "hover:border-brand/40",
    bar: "bg-brand",
    chip: "bg-brand-soft text-brand",
  },
  teal: {
    hover: "hover:border-teal/40",
    bar: "bg-teal",
    chip: "bg-teal-soft text-teal",
  },
  success: {
    hover: "hover:border-success/40",
    bar: "bg-success",
    chip: "bg-success-soft text-success",
  },
  danger: {
    hover: "hover:border-danger/40",
    bar: "bg-danger",
    chip: "bg-danger-soft text-danger",
  },
  violet: {
    hover: "hover:border-violet/40",
    bar: "bg-violet",
    chip: "bg-violet-soft text-violet",
  },
  warning: {
    hover: "hover:border-warning/40",
    bar: "bg-warning",
    chip: "bg-warning-soft text-warning",
  },
} satisfies Record<KpiTone, { hover: string; bar: string; chip: string }>;

/**
 * Stat card (Figma "KPI card · admin"): label and icon chip on top, big value below,
 * with a short coloured accent bar on the left edge.
 * With `href` the whole card is a link to the filtered list behind the number.
 *
 * @example
 * <KpiCard label="Failed deploys" value={3} tone="danger" icon={<Danger />} href="/admin/websites?release=FAILED" />
 */
export function KpiCard({
  label,
  value,
  icon,
  tone = "brand",
  href,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: KpiTone;
  href?: string;
}) {
  const styles = TONE[tone];
  const className = cn(
    "relative flex h-[128px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background px-5 py-4 shadow-kpi",
    href && [
      "transition-[border-color,box-shadow,transform] duration-150 outline-none hover:shadow-card focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:hover:-translate-y-0.5",
      styles.hover,
    ],
  );
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute top-4 bottom-4 left-0 w-1 rounded-r-full",
          styles.bar,
        )}
      />
      <span className="flex items-start justify-between gap-3">
        <span className="pt-1 text-sm leading-5 font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-[18px]",
            styles.chip,
          )}
        >
          {icon}
        </span>
      </span>
      <span className="font-heading text-[30px] leading-9 font-bold tracking-[-0.5px] text-foreground tabular-nums">
        {value}
      </span>
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

/** Row of KPI cards: 4 across on desktop, 2 on tablet, 1 on phones. */
export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}
