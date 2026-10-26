// Plans and KHQR payment logic. The backend owns the payment status; this layer reads it.
import { notFound } from "next/navigation";
import type { ActionResult } from "@/actions/result";
import { getSubscription } from "@/features/account/api";
import {
  createPayment,
  getPayment,
  listPlans,
  settlePendingPayments,
  mockSimulatePayment,
  type MockOutcome,
} from "@/features/billing/api";
import { listWebsites } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import { daysUntil } from "@/lib/format";
import type { PlanCode, Subscription } from "@/types/account";
import type { BillingPlan, PaidPlanCode, PaymentOrder } from "@/types/billing";
import type { Website } from "@/types/website";

const TEN_MINUTES_MS = 10 * 60_000;
const PETAL_IMAGE = "/images/billing/petal-and-stem.jpg";

export type PlansVariant = "dashboard" | "deploy" | "change";

export type PlansView = {
  variant: PlansVariant;
  plans: BillingPlan[];
  currentPlan: PlanCode;
  currentPlanName: string;
  currentPrice: string | null;
  daysLeft: number;
  websiteName: string;
  /** "settings" when the user came from Settings → Billing. */
  from: string;
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

async function primaryWebsite(userId: string): Promise<Website | null> {
  const live = await listWebsites(userId, { status: "LIVE" });
  if (live.items[0]) return live.items[0];
  const all = await listWebsites(userId);
  return all.items[0] ?? null;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function getPlansView(
  userId: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PlansView> {
  await settlePendingPayments(userId);
  const [plans, subscription, website] = await Promise.all([
    listPlans(),
    getSubscription(userId),
    primaryWebsite(userId),
  ]);
  const paid = subscription.renewsAt !== null;
  const variant: PlansVariant = paid ? "change" : first(searchParams.from) === "deploy" ? "deploy" : "dashboard";
  return {
    variant,
    plans: variant === "change" ? plans.filter((p) => p.code !== "FREE_TRIAL") : plans,
    currentPlan: subscription.plan,
    currentPlanName: subscription.planName,
    currentPrice: subscription.monthlyPrice,
    daysLeft: daysUntil(subscription.renewsAt ?? subscription.trialEndsAt),
    websiteName: website?.name ?? "your website",
    from: first(searchParams.from) === "settings" ? "settings" : "",
  };
}

function isPaidPlan(value: string): value is PaidPlanCode {
  return value === "PLUS" || value === "PRO" || value === "ULTRA";
}

/** Creates the payment for a plan and returns its id so the caller can open the payment page. */
export async function startPayment(userId: string, planCode: string): Promise<ActionResult<{ orderId: string }>> {
  if (!isPaidPlan(planCode)) return { ok: false, message: "Choose Plus, Pro or Ultra." };
  try {
    const [subscription, website] = await Promise.all([getSubscription(userId), primaryWebsite(userId)]);
    return createFor(userId, planCode, subscription, website);
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

async function createFor(
  userId: string,
  plan: PaidPlanCode,
  subscription: Subscription,
  website: Website | null,
): Promise<ActionResult<{ orderId: string }>> {
  const name = website?.name ?? "Your website";
  const order = await createPayment(userId, {
    plan,
    kind: subscription.renewsAt === null ? "SUBSCRIBE" : subscription.plan === plan ? "RENEW" : "CHANGE",
    websiteName: name,
    websiteDomain: website?.domain ?? `${slug(name)}.webblock.com`,
    websiteImageUrl: name === "Petal & Stem" || !website ? PETAL_IMAGE : website.thumbnailUrl,
  });
  return { ok: true, data: { orderId: order.id } };
}

/** "Generate new code" on an expired payment: same plan, fresh order. */
export async function regeneratePayment(userId: string, orderId: string): Promise<ActionResult<{ orderId: string }>> {
  try {
    const old = await getPayment(userId, orderId);
    if (old.status === "PAID") return { ok: true, data: { orderId: old.id } };
    const [subscription, website] = await Promise.all([getSubscription(userId), primaryWebsite(userId)]);
    return createFor(userId, old.plan, subscription, website);
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

export type PaymentView = {
  order: PaymentOrder;
  /** Where the back link goes. */
  backHref: string;
  backLabel: string;
  subtitle: string;
  /** Time left on the code when the page was rendered; the client counts down from here. */
  remainingMs: number;
  /** Full lifetime of the code, for the progress bar. */
  totalMs: number;
};

const SUBTITLE: Record<PaymentOrder["kind"], (order: PaymentOrder) => string> = {
  SUBSCRIBE: (o) => `You’re subscribing to ${o.planName} for ${o.websiteName}.`,
  CHANGE: (o) => `You’re switching ${o.websiteName} to the ${o.planName} plan.`,
  RENEW: (o) => `You’re adding another month of ${o.planName} to ${o.websiteName}.`,
};

export async function getPaymentView(
  userId: string,
  orderId: string,
  options: { from?: string; simulate?: string } = {},
): Promise<PaymentView> {
  // MOCK ONLY: `?mock=pay|expire|expiring` jumps to a payment state in development.
  const outcome = options.simulate;
  if (
    process.env.NODE_ENV !== "production" &&
    (outcome === "pay" || outcome === "expire" || outcome === "expiring")
  ) {
    await mockSimulatePayment(userId, orderId, outcome satisfies MockOutcome);
  }
  const order = await getPayment(userId, orderId).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const toSettings = options.from === "settings" && order.status === "PENDING";
  return {
    order,
    backHref: toSettings ? "/settings/billing" : "/billing/plans",
    backLabel: toSettings ? "Back to settings" : "Back to plans",
    subtitle: SUBTITLE[order.kind](order),
    remainingMs: Math.max(0, new Date(order.expiresAt).getTime() - Date.now()),
    totalMs: Math.max(new Date(order.expiresAt).getTime() - new Date(order.createdAt).getTime(), TEN_MINUTES_MS),
  };
}
