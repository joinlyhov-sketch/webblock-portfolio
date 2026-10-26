// Data access for the signed-in user's profile, subscription and plan orders. Mock now, Spring later.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import { planFilterOptions, planOrders, profiles as seed, subscriptions } from "@/mocks/account";
import type { OrderStatus, PlanCode, PlanOrder, Profile, Subscription } from "@/types/account";

const globalForStore = globalThis as typeof globalThis & { __wbProfiles?: Profile[] };
const store: Profile[] = (globalForStore.__wbProfiles ??= structuredClone(seed));

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
