// Data access for the signed-in user's profile, subscription and plan orders. Mock now, Spring later.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import {
  planFilterOptions,
  planOrders as ordersSeed,
  planLimits,
  profiles as seed,
  subscriptions as subscriptionsSeed,
} from "@/mocks/account";
import type { OrderStatus, PlanCode, PlanOrder, Profile, Subscription } from "@/types/account";
import type { PaidPlanCode } from "@/types/billing";

const globalForStore = globalThis as typeof globalThis & {
  __wbProfiles?: Profile[];
  __wbSubscriptions?: Record<string, Subscription>;
  __wbPlanOrders?: Record<string, PlanOrder[]>;
};
const store: Profile[] = (globalForStore.__wbProfiles ??= structuredClone(seed));
const subscriptions: Record<string, Subscription> = (globalForStore.__wbSubscriptions ??=
  structuredClone(subscriptionsSeed));
const planOrders: Record<string, PlanOrder[]> = (globalForStore.__wbPlanOrders ??=
  structuredClone(ordersSeed));

function find(userId: string): Profile {
  const profile = store.find((p) => p.id === userId);
  if (!profile) {
    throw new ApiError({ title: "Account not found", status: 404, detail: "We could not find your account." });
  }
  return profile;
}

export async function getProfile(userId: string): Promise<Profile> {
  await delay(120);
  return find(userId);
}

export async function updateProfile(userId: string, body: { fullName: string }): Promise<Profile> {
  await delay(300);
  const profile = find(userId);
  profile.fullName = body.fullName;
  return profile;
}

export async function updateAvatar(userId: string, avatarUrl: string | null): Promise<Profile> {
  await delay(400);
  const profile = find(userId);
  profile.avatarUrl = avatarUrl;
  return profile;
}

const globalForPasswords = globalThis as typeof globalThis & { __wbPasswords?: Map<string, string> };
const passwords: Map<string, string> = (globalForPasswords.__wbPasswords ??= new Map());

/** Mock only: Spring hashes and stores the password, and checks the current one itself. */
export async function setPassword(
  userId: string,
  body: { currentPassword?: string; newPassword: string },
): Promise<Profile> {
  await delay(400);
  const profile = find(userId);
  const saved = passwords.get(userId);
  if (profile.hasPassword && saved !== undefined && saved !== body.currentPassword) {
    throw new ApiError({ title: "Wrong password", status: 400, detail: "Your current password is not correct." });
  }
  passwords.set(userId, body.newPassword);
  profile.hasPassword = true;
  return profile;
}

export async function getSubscription(userId: string): Promise<Subscription> {
  await delay(150);
  const subscription = subscriptions[userId];
  if (!subscription) {
    throw new ApiError({ title: "No subscription", status: 404, detail: "This account has no plan yet." });
  }
  return subscription;
}

export type ListOrdersFilter = {
  status?: OrderStatus;
  plan?: PlanCode;
};

export async function listOrders(
  userId: string,
  filter: ListOrdersFilter,
  query: TableQuery,
): Promise<Page<PlanOrder>> {
  await delay();
  const sorted = (planOrders[userId] ?? [])
    .filter((o) => !filter.status || o.status === filter.status)
    .filter((o) => !filter.plan || o.plan === filter.plan);

  const { field, direction } = query.sort ?? { field: "createdAt", direction: "desc" };
  const sign = direction === "asc" ? 1 : -1;
  sorted.sort((a, b) =>
    field === "amount"
      ? sign * (Number(a.amount) - Number(b.amount))
      : sign * a.createdAt.localeCompare(b.createdAt),
  );
  return toPage(sorted, query);
}

export async function listPlanOptions(): Promise<{ value: PlanCode; label: string }[]> {
  return planFilterOptions as { value: PlanCode; label: string }[];
}

/**
 * Puts the user on a paid plan after a confirmed payment. Spring does this when the bank confirms;
 * the mock calls it from features/billing/api.ts.
 */
export async function activatePlan(
  userId: string,
  plan: PaidPlanCode,
  nextPaymentAt: string,
): Promise<Subscription> {
  const current = subscriptions[userId];
  if (!current) {
    throw new ApiError({ title: "No subscription", status: 404, detail: "This account has no plan yet." });
  }
  const meta = planLimits[plan];
  const used = (key: string) => current.usage.find((u) => u.key === key)?.used ?? 0;
  const next: Subscription = {
    ...current,
    plan,
    planName: meta.name,
    renewsAt: nextPaymentAt,
    monthlyPrice: meta.price,
    usage: [
      { key: "websites", label: "Websites", cardLabel: "Website", used: used("websites"), limit: meta.websites },
      {
        key: "redeploys",
        label: "Redeploys",
        cardLabel: "Redeploys this month",
        used: Math.min(meta.redeploys, used("redeploys") || used("deploys")),
        limit: meta.redeploys,
      },
      { key: "products", label: "Products", cardLabel: "Products", used: used("products"), limit: meta.products },
    ],
    includes: [...meta.includes],
  };
  subscriptions[userId] = next;
  find(userId).plan = plan;
  return next;
}

/** Adds a finished payment to the billing history. */
export async function recordPlanOrder(userId: string, order: PlanOrder): Promise<void> {
  const list = (planOrders[userId] ??= []);
  if (!list.some((o) => o.id === order.id)) list.unshift(order);
}
