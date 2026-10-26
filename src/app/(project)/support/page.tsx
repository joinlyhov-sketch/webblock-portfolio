import { requireUser } from "@/lib/auth/session";
import { getSupportView } from "@/service/support-service";
import { SupportView } from "@/components/support/support-view";

export const metadata = { title: "Contact Support" };

export default async function SupportPage() {
  const user = await requireUser();
  const data = await getSupportView(user.id);

  return <SupportView data={data} />;
}
