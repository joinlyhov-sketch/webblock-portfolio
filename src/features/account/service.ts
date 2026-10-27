// Profile, password, photo, subscription and billing history logic.
import type { ActionResult } from "@/lib/actions/result";
import {
  getProfile,
  getSubscription,
  listOrders,
  listPlanOptions,
  setPassword,
  updateAvatar,
  updateProfile,
  type ListOrdersFilter,
} from "./api";
import { settlePendingPayments } from "@/features/billing/api";
import { listWebsites } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import type { Page } from "@/lib/api/types";
import { formFile, imageToDataUrl } from "@/lib/files";
import { AVATAR_RULE, checkImage } from "@/lib/image-rules";
import { daysUntil } from "@/lib/format";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";
import { createCollector, formText } from "@/lib/validation/fields";
import type {
  OrderStatus,
  PlanOrder,
  Profile,
  SidebarSummary,
  Subscription,
} from "./types";

const MIN_PASSWORD_LENGTH = 8;

// ── Reads ────────────────────────────────────────────────────────────────────

export async function getProfileView(userId: string): Promise<Profile> {
  return getProfile(userId);
}

const BILLING_PERIOD_MS = 30 * 24 * 3_600_000;

/** How much of the current period has passed: the trial, or the 30 days before a paid plan renews. */
function trialProgress(subscription: Subscription): number {
  const end = new Date(subscription.renewsAt ?? subscription.trialEndsAt).getTime();
  const start = subscription.renewsAt ? end - BILLING_PERIOD_MS : new Date(subscription.trialStartsAt).getTime();
  const total = end - start;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / total) * 100)));
}

/** Data for the trial card and the user row at the bottom of the sidebar. */
export async function getSidebarView(
  userId: string,
): Promise<{ profile: Profile; summary: SidebarSummary }> {
  await settlePendingPayments(userId);
  const [profile, subscription, websites] = await Promise.all([
    getProfile(userId),
    getSubscription(userId).catch(() => null),
    listWebsites(userId, { status: "LIVE" }),
  ]);
  const liveWebsiteName = websites.items[0]?.name ?? null;

  if (!subscription) {
    return {
      profile,
      summary: { plan: "FREE_TRIAL", planLabel: "Free trial", daysLeft: 0, renewsAt: null, progress: 0, liveWebsiteName },
    };
  }
  return {
    profile,
    summary: {
      plan: subscription.plan,
      planLabel: subscription.planName,
      renewsAt: subscription.renewsAt,
      daysLeft: daysUntil(subscription.renewsAt ?? subscription.trialEndsAt),
      progress: trialProgress(subscription),
      liveWebsiteName,
    },
  };
}

export type BillingView = {
  subscription: Subscription;
  daysLeft: number;
  /** Length of the period the ring counts down: 14 trial days or 30 paid days. */
  periodDays: number;
  progress: number;
  /** Website named in "Pick a plan to keep … online". */
  websiteName: string | null;
  orders: Page<PlanOrder>;
  status: "ALL" | OrderStatus;
  plan: string;
  planOptions: { value: string; label: string }[];
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export async function getBillingView(
  userId: string,
  searchParams: SearchParams,
): Promise<BillingView> {
  const statusParam = first(searchParams.status);
  const planParam = first(searchParams.plan);
  const options = await listPlanOptions();
  const filter: ListOrdersFilter = {
    status: statusParam === "paid" ? "PAID" : statusParam === "expired" ? "EXPIRED" : undefined,
    plan: options.find((p) => p.value === planParam)?.value,
  };

  // A payment confirmed while the user was elsewhere still lands in the history.
  await settlePendingPayments(userId);
  const [subscription, orders, websites] = await Promise.all([
    getSubscription(userId),
    listOrders(
      userId,
      filter,
      parseTableQuery(searchParams, { sort: { field: "createdAt", direction: "desc" } }),
    ),
    listWebsites(userId, { status: "LIVE" }),
  ]);

  return {
    subscription,
    daysLeft: daysUntil(subscription.renewsAt ?? subscription.trialEndsAt),
    periodDays: subscription.renewsAt ? 30 : subscription.trialDays,
    progress: trialProgress(subscription),
    websiteName: websites.items[0]?.name ?? null,
    orders,
    status: filter.status ?? "ALL",
    plan: filter.plan ?? "",
    planOptions: [{ value: "", label: "All" }, ...options],
  };
}

// ── Writes ───────────────────────────────────────────────────────────────────

export async function saveProfile(userId: string, formData: FormData): Promise<ActionResult> {
  const fullName = formText(formData, "fullName");
  const c = createCollector();
  c.text("fullName", fullName, "Full name", { min: 2, max: 60 });
  if (c.hasErrors) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: c.errors,
      values: { fullName },
    };
  }
  try {
    await updateProfile(userId, { fullName });
    return { ok: true, data: undefined, message: "Profile saved" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values: { fullName } };
    throw e;
  }
}

export async function changePassword(userId: string, formData: FormData): Promise<ActionResult> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const profile = await getProfile(userId);

  const c = createCollector();
  if (profile.hasPassword && !currentPassword) c.add("currentPassword", "Enter your current password.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    c.add("password", `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (confirm !== password) c.add("confirmPassword", "The passwords do not match.");
  if (c.hasErrors) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: c.errors };
  }
  try {
    await setPassword(userId, { currentPassword, newPassword: password });
    return {
      ok: true,
      data: undefined,
      message: profile.hasPassword ? "Password changed" : "Password set. You can now sign in with your email.",
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message, fieldErrors: { currentPassword: [e.message] } };
    }
    throw e;
  }
}

export async function saveAvatar(userId: string, formData: FormData): Promise<ActionResult> {
  const file = formFile(formData, "photo");
  if (!file) return { ok: false, message: "Choose a photo first." };
  const problem = checkImage(file, AVATAR_RULE);
  if (problem) return { ok: false, message: problem };
  try {
    await updateAvatar(userId, await imageToDataUrl(file));
    return { ok: true, data: undefined, message: "Photo updated" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function removeAvatar(userId: string): Promise<ActionResult> {
  try {
    await updateAvatar(userId, null);
    return { ok: true, data: undefined, message: "Photo removed" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}
