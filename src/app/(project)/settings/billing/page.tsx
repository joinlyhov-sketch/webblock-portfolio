import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getBillingView, BillingView } from "@/features/account";

export const metadata = { title: "Billing" };

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const user = await requireUser();
  const data = await getBillingView(user.id, query);

  return <BillingView data={data} searchParams={query} />;
}
