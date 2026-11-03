import type { Plan } from "@/features/admin/types";

/**
 * The one plan catalogue. Admin → Plans edits it, and the landing pricing, the billing plan cards and
 * the account plan details all read it, so a price or limit change shows everywhere at once (Spring has
 * one `plans` table). Kept on globalThis so dev hot reloads don't drop an admin's edit.
 * `subscriberCount` is counted from the user accounts in features/admin/api.ts.
 */
const store = globalThis as typeof globalThis & { __wbPlans?: Plan[] };

export const planCatalogue: Plan[] = (store.__wbPlans ??= [
  {
    id: "a0c2e4f6-5d7b-4c9e-8f1a-2b4d6f8a0601",
    code: "FREE_TRIAL",
    name: "Free trial",
    priceMonthly: "0.00",
    trialDays: 14,
    websiteLimit: 1,
    // First deploy only: the trial has no redeploys.
    redeploysPerMonth: 0,
    productLimit: 30,
    monitoring: "Basic status monitoring",
    subscriberCount: 0,
    mostPopular: false,
  },
  {
    id: "a0c2e4f6-5d7b-4c9e-8f1a-2b4d6f8a0602",
    code: "PLUS",
    name: "Plus",
    priceMonthly: "9.99",
    trialDays: null,
    websiteLimit: 1,
    redeploysPerMonth: 3,
    productLimit: 30,
    monitoring: "Basic status monitoring",
    subscriberCount: 0,
    mostPopular: false,
  },
  {
    id: "a0c2e4f6-5d7b-4c9e-8f1a-2b4d6f8a0603",
    code: "PRO",
    name: "Pro",
    priceMonthly: "19.99",
    trialDays: null,
    websiteLimit: 3,
    redeploysPerMonth: 30,
    productLimit: 200,
    monitoring: "Logs",
    subscriberCount: 0,
    mostPopular: true,
  },
  {
    id: "a0c2e4f6-5d7b-4c9e-8f1a-2b4d6f8a0604",
    code: "ULTRA",
    name: "Ultra",
    priceMonthly: "39.99",
    trialDays: null,
    websiteLimit: 10,
    redeploysPerMonth: 100,
    productLimit: 1000,
    monitoring: "Logs",
    subscriberCount: 0,
    mostPopular: false,
  },
]);

/** Pro and Ultra include deploy logs on top of basic status monitoring. */
export const hasLogs = (plan: Plan) => plan.monitoring === "Logs";

/**
 * The plan's limits as the sentences the plan cards and the account page show ("Up to 3 websites").
 * MOCK ONLY: Spring returns these lines with the plan; here they are built from the numbers so an admin
 * edit changes the wording too.
 */
export function planLines(plan: Plan) {
  return {
    websites: plan.websiteLimit === 1 ? "1 website" : `Up to ${plan.websiteLimit.toLocaleString("en-US")} websites`,
    redeploys: `${plan.redeploysPerMonth.toLocaleString("en-US")} redeploys a month`,
    products: `Up to ${plan.productLimit.toLocaleString("en-US")} products`,
  };
}
