import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KpiTone =
  "brand" | "teal" | "success" | "danger" | "violet" | "warning";

const TONE = {
  brand: {
    bar: "bg-brand",
    icon: "text-brand inset-ring-brand/15",
    glow: "bg-brand/35",
    glowSoft: "bg-brand/20",
  },
  teal: {
    bar: "bg-teal",
    icon: "text-teal inset-ring-teal/15",
    glow: "bg-teal/35",
    glowSoft: "bg-teal/20",
  },
  success: {
    bar: "bg-success",
    icon: "text-success inset-ring-success/15",
    glow: "bg-success/35",
    glowSoft: "bg-success/20",
  },
  danger: {
    bar: "bg-danger",
    icon: "text-danger inset-ring-danger/15",
    glow: "bg-danger/35",
    glowSoft: "bg-danger/20",
  },
  violet: {
    bar: "bg-violet",
    icon: "text-violet inset-ring-violet/15",
    glow: "bg-violet/35",
    glowSoft: "bg-violet/20",
  },
  warning: {
    bar: "bg-warning",
    icon: "text-warning inset-ring-warning/15",
    glow: "bg-warning/35",
    glowSoft: "bg-warning/20",
  },
} satisfies Record<
  KpiTone,
  { bar: string; icon: string; glow: string; glowSoft: string }
>;

/**
 * Stat card (Figma "KPI card · admin"), glass style: label and icon tile on top, big value below,
 * a short coloured accent bar on the left edge. Two blurred glows of the tone sit behind a frosted
 * white pane, so the card reads as tinted glass; the icon sits on its own small glass tile.
 * Static: no hover or press effects. Not a link.
 *
 * @example
 * <KpiCard label="Failed deploys" value={3} tone="danger" icon={<Danger />} />
 */
export function KpiCard({
  label,
  value,
  icon,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: KpiTone;
}) {
  const styles = TONE[tone];
  return (
    <div
      className={cn(
        "relative isolate flex h-[104px] flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-background px-3.5 py-3 sm:h-[128px] sm:px-5 sm:py-4 shadow-kpi inset-ring-1 inset-ring-background/70",
      )}
    >
      {/* Colour behind the glass: a big glow bottom-right, a small one near the icon. */}
      <span
        aria-hidden
        className={cn(
          "absolute -right-10 -bottom-14 -z-20 size-40 rounded-full blur-2xl",
          styles.glow,
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute -top-8 right-6 -z-20 size-24 rounded-full blur-2xl",
          styles.glowSoft,
        )}
      />
      {/* The frosted pane: white fading to clearer towards the colour, blurring what is behind. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-br from-background/90 via-background/60 to-background/30 backdrop-blur-xl"
      />
      <span
        aria-hidden
        className={cn(
          "absolute top-4 bottom-4 left-0 w-1 rounded-r-full",
          styles.bar,
        )}
      />

      <span className="flex items-start justify-between gap-2 sm:gap-3">
        <span className="pt-0.5 text-xs leading-4 font-medium sm:pt-1 sm:text-sm sm:leading-5 text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            // Small glass tile: see-through white, blurred, thin tinted edge.
            "grid size-8 shrink-0 place-items-center rounded-xl sm:size-9 bg-background/60 shadow-button inset-ring-1 backdrop-blur-md [&_svg]:size-[18px]",
            styles.icon,
          )}
        >
          {icon}
        </span>
      </span>
      <span className="font-heading text-2xl leading-8 sm:text-[30px] sm:leading-9 font-bold tracking-[-0.5px] text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

/** Row of KPI cards: 4 across on desktop, 2 on tablet, 1 on phones. */
export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {children}
    </div>
  );
}
