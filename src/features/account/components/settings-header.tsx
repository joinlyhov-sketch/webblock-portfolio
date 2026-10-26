import { Breadcrumb } from "@/components/common/breadcrumb";
import { PillTabs } from "./pill-tabs";
import { SettingsArt } from "./settings-art";

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Billing", href: "/settings/billing" },
];

/** Breadcrumb, title, tabs and the decorative banner shared by both Settings screens (152px tall). */
export function SettingsHeader() {
  return (
    <header className="relative flex flex-col gap-3">
      <SettingsArt />
      <Breadcrumb current="Settings" />
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-[30px] leading-[34.5px] font-semibold tracking-[-0.6px] text-primary">Settings</h1>
          <p className="pt-1 text-sm leading-[21px] text-muted-foreground">Manage your personal information.</p>
        </div>
        <PillTabs tabs={tabs} label="Settings sections" />
      </div>
    </header>
  );
}
