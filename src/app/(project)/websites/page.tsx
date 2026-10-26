import { listWebsites, WebsitesView } from "@/features/websites";
import { requireUser } from "@/lib/auth/session";

export default async function WebsitesPage() {
  await requireUser();
  const data = await listWebsites();
  return <WebsitesView data={data} />;
}
