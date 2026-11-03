import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      {/* A page that marks itself `data-fit-viewport` (Billing history) fills exactly one screen and only its table scrolls,
          with the same 15px gap at the bottom as at the sides (like the Owner Portal). */}
      <main className="flex min-w-0 flex-1 flex-col gap-[15px] px-page pt-7 pb-12 has-[[data-fit-viewport]]:h-dvh has-[[data-fit-viewport]]:overflow-y-auto has-[[data-fit-viewport]]:pb-page">{children}</main>
    </div>
  );
}
