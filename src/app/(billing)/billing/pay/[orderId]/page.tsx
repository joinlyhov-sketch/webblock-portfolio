import { PaymentView } from "@/components/billing/payment-view";
import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getPaymentView } from "@/service/billing-service";

export const metadata = { title: "Payment" };

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { orderId } = await params;
  const query = await searchParams;
  const user = await requireUser();
  const view = await getPaymentView(user.id, orderId, { from: one(query.from), simulate: one(query.mock) });
  return <PaymentView view={view} />;
}
