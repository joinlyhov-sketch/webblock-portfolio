import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getNotificationsView } from "@/features/notifications";
import { getTemplatesView } from "@/features/templates";
import { getAllWebsites, getBusinessTypes, parseInitialFilter, WebsitesView } from "@/features/websites";

export const metadata = { title: "My Websites" };

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const user = await requireUser();
  const [websites, notifications, templates, businessTypes] = await Promise.all([
    getAllWebsites(user.id),
    getNotificationsView(user.id),
    getTemplatesView({}),
    getBusinessTypes(),
  ]);

  return (
    <WebsitesView
      websites={websites}
      notifications={notifications}
      templates={templates.templates}
      businessTypes={businessTypes}
      initialFilter={parseInitialFilter(query)}
    />
  );
}
