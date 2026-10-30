"use client";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { PillTabs } from "./pill-tabs";
import { SettingsArt } from "./settings-art";

export type SettingsTab = "profile" | "billing";

/** Breadcrumb, title, tabs and the decorative banner shared by both Settings screens (152px tall). */
export function SettingsHeader({ tab, onTab }: { tab: SettingsTab; onTab: (tab: SettingsTab) => void }) {
  return (
    <header className="relative flex flex-col gap-3">
      <SettingsArt />
      <Breadcrumb current="Settings" />
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-[30px] leading-[34.5px] font-semibold tracking-[-0.6px] text-primary">Settings</h1>
          <p className="pt-1 text-sm leading-[21px] text-muted-foreground">Manage your personal information.</p>
        </div>
        <PillTabs
          label="Settings sections"
          tabs={[
            { label: "Profile", active: tab === "profile", onSelect: () => onTab("profile") },
            { label: "Billing", active: tab === "billing", onSelect: () => onTab("billing") },
          ]}
        />
      </div>
    </header>
  );
}
