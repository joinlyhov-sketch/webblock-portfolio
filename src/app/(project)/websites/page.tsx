import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getNotificationsView } from "@/features/notifications";
import { getTemplatesView } from "@/features/templates";
import { getBusinessTypes, getWebsitesView, WebsitesView } from "@/features/websites";

export const metadata = { title: "My Websites" };

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const user = await requireUser();
  const [data, notifications, templates, businessTypes] = await Promise.all([
    getWebsitesView(user.id, query),
    getNotificationsView(user.id),
    getTemplatesView({}),
    getBusinessTypes(),
  ]);

  return (
    <WebsitesView
      data={data}
      notifications={notifications}
      templates={templates.templates}
      businessTypes={businessTypes}
      searchParams={query}
    />
  );
}
