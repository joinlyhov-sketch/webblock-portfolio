import { cn } from "@/lib/utils";

/** Subscription plans. Same values as the API's plan code. */
export type PlanTier = "FREE_TRIAL" | "PLUS" | "PRO" | "ULTRA";

type PlanMeta = { label: string; badge: string; dot: string };

const PLAN = {
  FREE_TRIAL: { label: "Free trial", badge: "bg-neutral-soft text-muted-foreground", dot: "bg-placeholder" },
  PLUS: { label: "Plus", badge: "bg-primary-soft text-brand-strong", dot: "bg-primary" },
  PRO: { label: "Pro", badge: "bg-gold-soft text-gold", dot: "bg-gold-strong" },
  ULTRA: { label: "Ultra", badge: "bg-violet-soft text-violet", dot: "bg-violet" },
} satisfies Record<PlanTier, PlanMeta>;

/** "Pro", "Free trial"… */
export function planLabel(plan: PlanTier): string {
  return PLAN[plan].label;
}

/** Plan pill with a coloured dot (Figma "Plan badge"). */
export function PlanBadge({ plan, className }: { plan: PlanTier; className?: string }) {
  const meta = PLAN[plan];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
