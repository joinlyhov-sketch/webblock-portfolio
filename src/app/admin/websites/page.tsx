import {
  getWebsite,
  listDeploys,
  listWebsites,
  WebsitesView,
  type PlanCode,
  type ReleaseStatus,
} from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "User Websites" };

const RELEASES: ReleaseStatus[] = ["LIVE", "GOING_LIVE", "FAILED"];
const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
const param = (v: SearchParams[string]) =>
  typeof v === "string" && v ? v : undefined;

export default async function AdminWebsitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const release = RELEASES.find((r) => r === query.release);
  const websiteId = param(query.website);

  const [websites, detail] = await Promise.all([
    listWebsites(
      {
        q: param(query.q),
        release,
        plan: PLANS.find((p) => p === query.plan),
        ownerId: param(query.owner),
      },
      parseTableQuery(query, {
        sort: { field: "lastDeployAt", direction: "desc" },
      }),
    ),
    websiteId
      ? Promise.all([
          getWebsite(websiteId),
          listDeploys({ websiteId }, { page: 0, size: 3 }),
        ]).then(([website, deploys]) => ({ website, deploys }))
      : null,
  ]);

  return (
    <WebsitesView websites={websites} searchParams={query} detail={detail} />
  );
}
