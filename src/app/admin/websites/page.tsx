import { WebsitesView } from "@/features/admin/components/admin-client-views";
import {
  getWebsite,
  listDeploys,
  listWebsites,
  type SiteStatus,
} from "@/features/admin";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "User Websites" };

const SITES: SiteStatus[] = ["ONLINE", "NOT_DEPLOYED", "OFFLINE_BILLING", "SUSPENDED"];
const param = (v: SearchParams[string]) =>
  typeof v === "string" && v ? v : undefined;

export default async function AdminWebsitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const websiteId = param(query.website);

  const base = {
    q: param(query.q),
    site: SITES.find((s) => s === query.site),
    ownerId: param(query.owner),
  };
  const [websites, detail] = await Promise.all([
    listWebsites(
      base,
      parseTableQuery(query, {
        sort: { field: "lastDeployAt", direction: "desc" },
      }),
    ),
    websiteId
      ? Promise.all([
          getWebsite(websiteId),
          listDeploys({ websiteId }, { page: 0, size: 3 }),
        ])
          .then(([website, deploys]) => ({ website, deploys }))
          .catch(nullIfNotFound)
      : null,
  ]);

  return (
    <WebsitesView
      websites={websites}
      searchParams={query}
      detail={detail}
    />
  );
}
