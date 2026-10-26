import type { Currency } from "@/lib/format";

export type PlanCode = "TRIAL" | "PLUS" | "PRO" | "ULTRA";

/**
 * Subscription plan as returned by `GET /plans` (public, no auth). Proposed contract: the backend
 * enforces these limits, so they are structured fields, not display strings.
 */
export type Plan = {
  id: string;
  code: PlanCode;
  name: string;
  /** Monthly price as a decimal string, "0" for the trial. */
  priceMonthly: string;
  currency: Currency;
  /** Trial length; null for paid plans. */
  trialDays: number | null;
  websiteLimit: number;
  redeploysPerMonth: number;
  productLimit: number;
  logsEnabled: boolean;
  popular: boolean;
};
