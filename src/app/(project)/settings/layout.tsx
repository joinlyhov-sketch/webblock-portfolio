import type { ReactNode } from "react";
import { SettingsHeader } from "@/components/settings/settings-header";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsHeader />
      <div className="flex flex-1 flex-col gap-[15px]">{children}</div>
    </>
  );
}
