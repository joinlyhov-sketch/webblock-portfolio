import { exportUsersCsv } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";

/** CSV download for the "Export CSV" button on User Accounts. Keeps the current search. */
export async function GET(request: Request) {
  await requireAdmin();
  const q = new URL(request.url).searchParams.get("q") ?? undefined;
  const csv = await exportUsersCsv({ q });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="webblock-accounts.csv"',
    },
  });
}
