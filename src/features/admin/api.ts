// Admin Portal data access. Mock now; when Spring is ready only the function bodies change.
// Every function maps to one endpoint under /api/admin (noted above each).
import { ApiError } from "@/lib/api/errors";
import type { Page } from "@/lib/api/types";
import { toPage, type TableQuery } from "@/lib/table-query";
import { adminNotifications } from "@/mocks/admin-notifications";
import { adminOverview } from "@/mocks/admin-overview";
import {
  payments,
  plans,
  subscriptionStats,
  subscriptions,
} from "@/mocks/admin-subscriptions";
import { userAccounts, userStats } from "@/mocks/admin-users";
import { adminDeploys, adminWebsites } from "@/mocks/admin-websites";
import type {
  AdminNotification,
  AdminOverview,
  NotificationFilters,
  AdminWebsite,
  Deploy,
  Payment,
  Plan,
  PlanInput,
  Subscription,
  SubscriptionFilters,
  SubscriptionStats,
  UserAccount,
  UserFilters,
  UserStats,
  WebsiteFilters,
} from "./types";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

/** Spring-style sort on any top-level field; nulls last. */
function sorted<T>(items: T[], sort: TableQuery["sort"]): T[] {
  if (!sort) return items;
  const field = sort.field as keyof T;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });
}

const matches = (q: string | undefined, ...values: string[]) =>
  !q || values.some((v) => v.toLowerCase().includes(q.trim().toLowerCase()));

function notFound(entity: string): never {
  throw new ApiError({ title: "Not found", status: 404, detail: `${entity} not found.` });
}

// ── Overview ─────────────────────────────────────────────────────────────────

/** GET /api/admin/overview */
export async function getOverview(): Promise<AdminOverview> {
  await delay();
  return adminOverview;
}

// ── Users ────────────────────────────────────────────────────────────────────

/** GET /api/admin/users?q=&page=&size=&sort= */
export async function listUsers(filters: UserFilters, query: TableQuery): Promise<Page<UserAccount>> {
  await delay();
  const items = userAccounts.filter((u) => matches(filters.q, u.fullName, u.email));
  return toPage(sorted(items, query.sort), query);
}

/** GET /api/admin/users/stats */
export async function getUserStats(): Promise<UserStats> {
  await delay(150);
  return userStats;
}

/** GET /api/admin/users/{userId} */
export async function getUser(userId: string): Promise<UserAccount> {
  await delay(150);
  return userAccounts.find((u) => u.id === userId) ?? notFound("User");
}

/** GET /api/admin/users/export.csv?q= — the CSV file body. */
export async function exportUsersCsv(filters: UserFilters): Promise<string> {
  await delay();
  const cell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const rows = userAccounts
    .filter((u) => matches(filters.q, u.fullName, u.email))
    .map((u) => [u.fullName, u.email, u.websiteCount, u.plan, u.status, u.joinedAt].map(cell).join(","));
  return ["Name,Email,Websites,Plan,Status,Joined", ...rows].join("\n");
}

/** POST /api/admin/users/{userId}/suspend */
export async function suspendUser(userId: string): Promise<UserAccount> {
  await delay();
  const user = userAccounts.find((u) => u.id === userId) ?? notFound("User");
  if (user.status === "SUSPENDED") {
    throw new ApiError({ title: "Conflict", status: 409, detail: `${user.fullName} is already suspended.` });
  }
  user.status = "SUSPENDED";
  return user;
}

/** POST /api/admin/users/{userId}/reactivate */
export async function reactivateUser(userId: string): Promise<UserAccount> {
  await delay();
  const user = userAccounts.find((u) => u.id === userId) ?? notFound("User");
  user.status = "ACTIVE";
  return user;
}

// ── Websites ─────────────────────────────────────────────────────────────────

/** GET /api/admin/websites?q=&release=&ownerId=&page=&size=&sort= */
export async function listWebsites(filters: WebsiteFilters, query: TableQuery): Promise<Page<AdminWebsite>> {
  await delay();
  const items = adminWebsites.filter(
    (w) =>
      matches(filters.q, w.name, w.domain, w.ownerName) &&
      (!filters.release || w.releaseStatus === filters.release) &&
      (!filters.ownerId || w.ownerId === filters.ownerId),
  );
  return toPage(sorted(items, query.sort), query);
}

/** GET /api/admin/websites/{websiteId} */
export async function getWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay(150);
  return adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
}

/** GET /api/admin/deploys?websiteId=&page=&size= — newest first. */
export async function listDeploys(
  filters: { websiteId?: string },
  query: TableQuery,
): Promise<Page<Deploy>> {
  await delay(150);
  const items = adminDeploys
    .filter((d) => !filters.websiteId || d.websiteId === filters.websiteId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return toPage(items, query);
}

const redeployKeys = new Map<string, Deploy>();

/**
 * POST /api/admin/websites/{websiteId}/redeploy (Idempotency-Key header).
 * The backend runs the pipeline and its retries; we only trigger it and show the state.
 */
export async function redeployWebsite(websiteId: string, idempotencyKey: string): Promise<Deploy> {
  await delay();
  const existing = redeployKeys.get(idempotencyKey);
  if (existing) return existing;

  const website = adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  if (website.siteStatus === "SUSPENDED") {
    throw new ApiError({ title: "Conflict", status: 409, detail: "Resume hosting before redeploying." });
  }
  if (website.releaseStatus === "GOING_LIVE") {
    throw new ApiError({ title: "Conflict", status: 409, detail: "A deploy is already in progress." });
  }
  if (website.redeploysLeft <= 0) {
    throw new ApiError({ title: "Limit reached", status: 429, detail: "No redeploys left on this plan this month." });
  }

  const previous = adminDeploys.filter((d) => d.websiteId === websiteId);
  const deploy: Deploy = {
    id: crypto.randomUUID(),
    websiteId,
    websiteName: website.name,
    websiteThumbnailUrl: website.thumbnailUrl,
    ownerName: website.ownerName,
    number: Math.max(0, ...previous.map((d) => d.number)) + 1,
    status: "GOING_LIVE",
    currentStep: 1,
    totalSteps: 5,
    stepLabel: "Request received",
    startedAt: new Date().toISOString(),
    durationSeconds: null,
  };
  adminDeploys.unshift(deploy);
  website.releaseStatus = "GOING_LIVE";
  website.routingStatus = "UPDATING";
  website.lastDeployAt = deploy.startedAt;
  website.redeploysLeft -= 1;
  redeployKeys.set(idempotencyKey, deploy);
  return deploy;
}

/** POST /api/admin/websites/{websiteId}/suspend — takes the site offline, content is kept. */
export async function suspendWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay();
  const website = adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  website.siteStatus = "SUSPENDED";
  return website;
}

/** POST /api/admin/websites/{websiteId}/resume */
export async function resumeWebsite(websiteId: string): Promise<AdminWebsite> {
  await delay();
  const website = adminWebsites.find((w) => w.id === websiteId) ?? notFound("Website");
  website.siteStatus = website.liveRelease ? "ONLINE" : "NOT_DEPLOYED";
  return website;
}

// ── Subscriptions ────────────────────────────────────────────────────────────

/** GET /api/admin/subscriptions?q=&status=&plan=&page=&size=&sort= */
export async function listSubscriptions(
  filters: SubscriptionFilters,
  query: TableQuery,
): Promise<Page<Subscription>> {
  await delay();
  const items = subscriptions.filter(
    (s) =>
      matches(filters.q, s.userName, s.userEmail, s.websiteName) &&
      (!filters.status || s.status === filters.status) &&
      (!filters.plan || s.plan === filters.plan),
  );
  return toPage(sorted(items, query.sort), query);
}

/** GET /api/admin/subscriptions/stats */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  await delay(150);
  return subscriptionStats;
}

/** GET /api/admin/subscriptions/{subscriptionId} */
export async function getSubscription(subscriptionId: string): Promise<Subscription> {
  await delay(150);
  return subscriptions.find((s) => s.id === subscriptionId) ?? notFound("Subscription");
}

/** GET /api/admin/subscriptions/{subscriptionId}/payments — newest first. */
export async function listPayments(subscriptionId: string, query: TableQuery): Promise<Page<Payment>> {
  await delay(150);
  const items = payments
    .filter((p) => p.subscriptionId === subscriptionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return toPage(items, query);
}

// ── Plans ────────────────────────────────────────────────────────────────────

/** GET /api/admin/plans */
export async function listPlans(): Promise<Page<Plan>> {
  await delay();
  return toPage(plans, { page: 0, size: plans.length });
}

/** GET /api/admin/plans/{planId} */
export async function getPlan(planId: string): Promise<Plan> {
  await delay(150);
  return plans.find((p) => p.id === planId) ?? notFound("Plan");
}

/** PUT /api/admin/plans/{planId} — applies to new subscriptions and renewals. */
export async function updatePlan(planId: string, input: PlanInput): Promise<Plan> {
  await delay();
  const plan = plans.find((p) => p.id === planId) ?? notFound("Plan");
  Object.assign(plan, input);
  return plan;
}

// ── Notifications ────────────────────────────────────────────────────────────

/** GET /api/admin/notifications?unread=&page=&size= — newest first. */
export async function listNotifications(
  filters: NotificationFilters,
  query: TableQuery,
): Promise<Page<AdminNotification>> {
  await delay(150);
  const items = adminNotifications
    .filter((n) => !filters.unread || n.readAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return toPage(items, query);
}

/** GET /api/admin/notifications/unread-count */
export async function getUnreadNotificationCount(): Promise<number> {
  await delay(100);
  return adminNotifications.filter((n) => n.readAt === null).length;
}

/** POST /api/admin/notifications/{notificationId}/read */
export async function markNotificationRead(notificationId: string): Promise<AdminNotification> {
  await delay(150);
  const notification = adminNotifications.find((n) => n.id === notificationId) ?? notFound("Notification");
  notification.readAt ??= new Date().toISOString();
  return notification;
}

/** POST /api/admin/notifications/read-all */
export async function markAllNotificationsRead(): Promise<void> {
  await delay(150);
  const now = new Date().toISOString();
  for (const n of adminNotifications) n.readAt ??= now;
}
