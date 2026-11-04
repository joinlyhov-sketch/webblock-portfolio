import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAdminProfile, listNotifications } from "@/features/admin";
import { AdminClientProvider } from "@/features/admin/components/admin-client-context";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  const [profile, notifications] = await Promise.all([
    getAdminProfile(),
    listNotifications({}, { page: 0, size: 20 }),
  ]);
  return (
    // The sidebar stays put; only the page content scrolls. Below 1024px (`data-mobile-ui`) the sidebar
    // becomes bottom tabs and the whole page scrolls, like the Owner Portal.
    <div data-mobile-ui className="flex h-dvh overflow-hidden max-lg:h-auto max-lg:min-h-dvh max-lg:flex-col max-lg:overflow-visible">
      <AdminSidebar user={profile} />
      {/* Flex column so a `DataTable fill` can stretch to the bottom of the screen. */}
      <main className="dashboard-content flex min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-page pt-7 pb-page">
        <AdminClientProvider profile={profile} notifications={notifications.items}>
          {children}
        </AdminClientProvider>
      </main>
    </div>
  );
}
