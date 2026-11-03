import type { ReactNode } from "react";
import { OwnerSidebar } from "@/components/layout/owner-sidebar";

export default async function PortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  return (
    <div data-mobile-ui className="flex min-h-dvh max-lg:flex-col">
      <OwnerSidebar websiteId={websiteId} />
      {/* A page that marks itself `data-fit-viewport` (Products) fills exactly one screen and only its list scrolls,
          with the same 15px gap at the bottom as at the sides. */}
      <main className="dashboard-content flex min-w-0 flex-1 flex-col gap-6 px-page pt-8 pb-12 has-[[data-fit-viewport]]:h-dvh has-[[data-fit-viewport]]:overflow-y-auto has-[[data-fit-viewport]]:pb-page">{children}</main>
    </div>
  );
}
