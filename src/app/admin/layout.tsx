import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1 px-page pt-7 pb-12">{children}</main>
    </div>
  );
}
