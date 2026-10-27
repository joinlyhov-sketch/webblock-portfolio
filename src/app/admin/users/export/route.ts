import { exportUsersCsv, type PlanCode } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";

const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];

/** CSV download for the "Export CSV" button on User Accounts. Keeps the current search and plan filter. */
export async function GET(request: Request) {
  await requireAdmin();
  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? undefined;
  const plan = PLANS.find((p) => p === params.get("plan"));
  const csv = await exportUsersCsv({ q, plan });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="webblock-accounts.csv"',
    },
  });
}
