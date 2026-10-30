import {
  getUser,
  getWebsite,
  listDeploys,
  getUserStats,
  listUsers,
  listWebsites,
  UsersView,
  type PlanCode,
} from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "User Accounts" };

const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
const param = (v: SearchParams[string]) =>
  typeof v === "string" && v ? v : undefined;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const userId = param(query.user);
  const websiteId = userId ? param(query.website) : undefined;

  const [users, stats, detail, websiteDetail] = await Promise.all([
    listUsers(
      { q: param(query.q), plan: PLANS.find((p) => p === query.plan) },
      parseTableQuery(query, {
        size: 9,
        sort: { field: "joinedAt", direction: "desc" },
      }),
    ),
    getUserStats(),
    userId
      ? Promise.all([
          getUser(userId),
          listWebsites({ ownerId: userId }, { page: 0, size: 20 }),
        ]).then(([user, websites]) => ({ user, websites }))
      : null,
    websiteId
      ? Promise.all([
          getWebsite(websiteId),
          listDeploys({ websiteId }, { page: 0, size: 3 }),
        ]).then(([website, deploys]) => ({ website, deploys }))
      : null,
  ]);

  return (
    <UsersView
      users={users}
      stats={stats}
      searchParams={query}
      detail={detail}
      websiteDetail={websiteDetail}
    />
  );
}
