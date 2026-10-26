import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getNotificationsView } from "@/service/notification-service";
import { getTemplatesView } from "@/service/template-service";
import { getBusinessTypes, getWebsitesView } from "@/service/website-service";
import { WebsitesView } from "@/components/website/websites-view";

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
