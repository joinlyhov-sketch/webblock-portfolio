import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getTemplatesView, TemplatesView } from "@/features/templates";
import { getBusinessTypes } from "@/features/websites";

export const metadata = { title: "Templates" };

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  await requireUser();
  const [data, businessTypes] = await Promise.all([getTemplatesView(query), getBusinessTypes()]);

  return <TemplatesView data={data} businessTypes={businessTypes} />;
}
