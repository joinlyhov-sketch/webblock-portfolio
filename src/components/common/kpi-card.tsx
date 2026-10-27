import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type KpiTone = "brand" | "teal" | "success" | "danger" | "violet" | "warning";

const TONE = {
  brand: { border: "border-brand", bar: "bg-brand", chip: "bg-brand-soft text-brand" },
  teal: { border: "border-teal", bar: "bg-teal", chip: "bg-teal-soft text-teal" },
  success: { border: "border-success", bar: "bg-success", chip: "bg-success-soft text-success" },
  danger: { border: "border-danger", bar: "bg-danger", chip: "bg-danger-soft text-danger" },
  violet: { border: "border-violet", bar: "bg-violet", chip: "bg-violet-soft text-violet" },
  warning: { border: "border-warning", bar: "bg-warning", chip: "bg-warning-soft text-warning" },
} satisfies Record<KpiTone, { border: string; bar: string; chip: string }>;

/**
 * Stat card (Figma "KPI card · admin"): coloured left bar, icon chip, label and a big value.
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
    "relative flex h-[174px] flex-col justify-between overflow-hidden rounded-[20px] border bg-background py-[22px] pr-[22px] pl-[30px] shadow-kpi",
    styles.border,
    href &&
      "transition-[box-shadow,transform] duration-150 outline-none hover:shadow-card focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:hover:-translate-y-0.5",
  );
  const content = (
    <>
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5 opacity-85", styles.bar)} />
      <span className="flex items-center gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-full [&_svg]:size-5", styles.chip)}>
          {icon}
        </span>
        <span className="text-[15px] font-medium text-foreground-soft">{label}</span>
      </span>
      <span className="font-heading text-[34px] leading-[42px] font-bold tracking-[-0.56px] text-foreground tabular-nums">
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
  return <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}
