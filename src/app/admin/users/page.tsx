import { getUser, getUserStats, listUsers, listWebsites, UsersView } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "User Accounts" };

const param = (v: SearchParams[string]) => (typeof v === "string" && v ? v : undefined);

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const query = await searchParams;
  const userId = param(query.user);

  const [users, stats, detail] = await Promise.all([
    listUsers({ q: param(query.q) }, parseTableQuery(query, { size: 9, sort: { field: "joinedAt", direction: "desc" } })),
    getUserStats(),
    userId
      ? Promise.all([getUser(userId), listWebsites({ ownerId: userId }, { page: 0, size: 20 })]).then(
          ([user, websites]) => ({ user, websites }),
        )
      : null,
  ]);

  return <UsersView users={users} stats={stats} searchParams={query} detail={detail} />;
}
