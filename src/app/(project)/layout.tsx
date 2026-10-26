import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-[15px] px-page pt-7 pb-12">{children}</main>
    </div>
  );
}
