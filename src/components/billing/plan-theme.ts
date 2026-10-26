import type { PlanCode } from "@/types/account";

/** Colours of each plan tier on the plans and payment screens. Tokens live in globals.css. */
export type TierTheme = {
  /** Gradient + border of the card. */
  card: string;
  /** Name pill ("PLUS"). */
  pill: string;
  /** Price number. */
  price: string;
  /** Divider under the price. */
  divider: string;
  /** Full-width CTA button. */
  cta: string;
  /** Current-plan treatment: border and "Current plan" label. */
  current: { card: string; pill: string };
  /** Feature icon colour. */
  icon: string;
};

export const TIER_THEME: Record<Exclude<PlanCode, "FREE_TRIAL">, TierTheme> = {
  PLUS: {
    card: "border-tier-plus-border from-tier-plus-from",
    pill: "bg-tier-plus-soft text-tier-plus",
    price: "text-tier-plus",
    divider: "bg-border",
    cta: "bg-linear-[172deg] from-tier-plus-cta from-0% to-tier-plus to-71% hover:brightness-95",
    current: {
      card: "border-2 border-primary",
      pill: "bg-primary/14 text-primary",
    },
    icon: "text-primary",
  },
  PRO: {
    card: "border-tier-pro-border from-tier-pro-from",
    pill: "bg-tier-pro-soft text-tier-pro",
    price: "text-tier-pro",
    divider: "bg-tier-pro-soft",
    cta: "bg-tier-pro-accent hover:bg-tier-pro-accent hover:brightness-95",
    current: {
      card: "border-2 border-tier-pro-accent",
      pill: "bg-tier-pro-accent/14 text-tier-pro-accent",
    },
    icon: "text-tier-pro-accent",
  },
  ULTRA: {
    card: "border-tier-ultra-border from-tier-ultra-from",
    pill: "bg-tier-ultra-soft text-tier-ultra",
    price: "text-tier-ultra",
    divider: "bg-border",
    cta: "bg-tier-ultra-cta hover:bg-tier-ultra-cta hover:brightness-95",
    current: {
      card: "border-2 border-tier-ultra-cta",
      pill: "bg-tier-ultra-cta/14 text-tier-ultra-cta",
    },
    icon: "text-tier-ultra-cta",
  },
};
