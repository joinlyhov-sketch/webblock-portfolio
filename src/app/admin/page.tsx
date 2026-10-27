import { getOverview, listDeploys, OverviewView } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const query = await searchParams;
  const [overview, deploys] = await Promise.all([getOverview(), listDeploys({}, { page: 0, size: 3 })]);
  return <OverviewView overview={overview} deploys={deploys} searchParams={query} />;
}
