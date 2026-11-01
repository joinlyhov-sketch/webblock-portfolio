import type { PlanOrder, Profile, Subscription } from "@/features/account/types";
import { daysAgo, daysFromNow, hoursAgo } from "./time";

export const profiles: Profile[] = [
  {
    id: "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90",
    fullName: "Sovannarith Soeun",
    initials: "SV",
    email: "sovannarith@gmail.com",
    avatarUrl: "/mock/avatars/sovannarith-soeun.jpg",
    plan: "FREE_TRIAL",
    // Signed up the day the 14-day trial started (5 days ago, see `subscriptions`).
    memberSince: daysAgo(5),
    lastSignInAt: hoursAgo(1),
    hasPassword: false,
    googleEmail: "sovannarith@gmail.com",
  },
  {
    id: "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51",
    fullName: "Dara Admin",
    initials: "DA",
    email: "admin@webblock.app",
    avatarUrl: null,
    plan: "PLUS",
    memberSince: daysAgo(66),
    lastSignInAt: daysAgo(1),
    hasPassword: true,
    googleEmail: null,
  },
];

/** The trial runs 14 days and 9 are left. */
export const subscriptions: Record<string, Subscription> = {
  "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90": {
    plan: "FREE_TRIAL",
    planName: "Free trial",
    trialStartsAt: daysAgo(5),
    trialEndsAt: daysFromNow(9),
    trialDays: 14,
    renewsAt: null,
    monthlyPrice: null,
    startingPrice: "9.99",
    usage: [
      { key: "websites", label: "Websites", cardLabel: "Website", used: 1, limit: 1 },
      { key: "deploys", label: "Deploys", cardLabel: "Deploy", used: 1, limit: 1 },
      { key: "products", label: "Products", cardLabel: "Products", used: 12, limit: 30 },
    ],
    includes: ["1 website", "First deploy only", "Up to 30 products", "Basic status monitoring"],
  },
  "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51": {
    plan: "PLUS",
    planName: "Plus",
    trialStartsAt: daysAgo(66),
    trialEndsAt: daysAgo(52),
    trialDays: 14,
    renewsAt: daysFromNow(16),
    monthlyPrice: "9.99",
    startingPrice: "9.99",
    usage: [
      { key: "websites", label: "Websites", cardLabel: "Website", used: 1, limit: 1 },
      { key: "redeploys", label: "Redeploys", cardLabel: "Redeploys this month", used: 2, limit: 3 },
      { key: "products", label: "Products", cardLabel: "Products", used: 18, limit: 30 },
    ],
    includes: ["1 website", "3 redeploys a month", "Up to 30 products", "Basic status monitoring"],
  },
};

/** A trial user has nothing to pay yet, so the list starts empty. */
export const planOrders: Record<string, PlanOrder[]> = {
  "0f8a2c4e-5b1d-4e7a-9c3f-2d6b8e1a7c90": [],
  "5c2e7a91-3d4b-4f6e-8a1c-9b0d2e3f4a51": [
    // One website (Plus allows one): Still Point Studio. Paid after the trial ended, a Pro upgrade QR
    // that was never paid, then the renewal 14 days ago (renews in 16 = 30-day period).
    { id: "a1f0c2d4-0001-4a10-9b01-000000000001", plan: "PRO", planName: "Pro plan", websiteName: "Still Point Studio", period: "Monthly", createdAt: daysAgo(21), amount: "19.99", currency: "USD", status: "EXPIRED" },
    { id: "a1f0c2d4-0001-4a10-9b01-000000000002", plan: "PLUS", planName: "Plus plan", websiteName: "Still Point Studio", period: "Monthly", createdAt: daysAgo(51), amount: "9.99", currency: "USD", status: "PAID" },
    { id: "a1f0c2d4-0001-4a10-9b01-000000000003", plan: "PLUS", planName: "Plus plan", websiteName: "Still Point Studio", period: "Monthly · renewal", createdAt: daysAgo(14), amount: "9.99", currency: "USD", status: "PAID" },
  ],
};

export const planFilterOptions = [
  { value: "FREE_TRIAL", label: "Free trial" },
  { value: "PLUS", label: "Plus" },
  { value: "PRO", label: "Pro" },
  { value: "ULTRA", label: "Ultra" },
];

/** Limits and price of each paid plan (the same numbers the plans screens show). */
export const planLimits = {
  PLUS: {
    name: "Plus",
    price: "9.99",
    websites: 1,
    redeploys: 3,
    products: 30,
    includes: ["1 website", "3 redeploys a month", "Up to 30 products", "Basic status monitoring"],
  },
  PRO: {
    name: "Pro",
    price: "19.99",
    websites: 3,
    redeploys: 30,
    products: 200,
    includes: ["Up to 3 websites", "30 redeploys a month", "Up to 200 products", "Basic status monitoring", "Logs"],
  },
  ULTRA: {
    name: "Ultra",
    price: "39.99",
    websites: 10,
    redeploys: 100,
    products: 1000,
    includes: ["Up to 10 websites", "100 redeploys a month", "Up to 1,000 products", "Basic status monitoring", "Logs"],
  },
} as const;
