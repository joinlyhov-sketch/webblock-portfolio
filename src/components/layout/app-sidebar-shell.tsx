"use client";

import Link from "next/link";
import { Avatar } from "@/components/common/avatar";
import { userNav } from "@/config/nav";
import { useProfileUpdates } from "@/hooks/use-profile-updates";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";
import type { Profile, SidebarSummary } from "@/features/account";
import { BottomNav } from "./bottom-nav";
import { MobileHeader } from "./mobile-header";
import { SidebarNav } from "./sidebar-nav";
import { SidebarShell } from "./sidebar-shell";
import { SignOutButton } from "./sign-out-button";
import { TrialCard } from "./trial-card";

/** Interactive part of the user sidebar. Same frame, collapse button and footer as the Admin sidebar. */
export function AppSidebarShell({
  profile: serverProfile,
  summary,
}: {
  profile: Pick<Profile, "fullName" | "initials" | "email" | "avatarUrl">;
  summary: SidebarSummary;
}) {
  const profile = useProfileUpdates(serverProfile);
  const { narrow, collapsed, toggle } = useSidebarCollapse();

  return (
    <>
    {/* Below 1024px the sidebar is replaced by a header (account menu) and bottom tabs, like the Owner Portal.
        No bell here: My Websites shows its own in the page header. */}
    <MobileHeader profile={profile} homeHref="/websites" notifications={null}>
      <Link href="/billing/plans" prefetch className="flex min-h-12 items-center rounded-xl px-3">
        View plans
      </Link>
    </MobileHeader>
    <BottomNav items={userNav} />
    <SidebarShell
      className="max-lg:hidden"
      homeHref="/websites"
      narrow={narrow}
      collapsed={collapsed}
      onToggleCollapsed={toggle}
      aboveFooter={!collapsed && <TrialCard summary={summary} />}
      footer={
        <div className={cn("flex items-center gap-2.5 px-2 py-1.5", collapsed && "flex-col gap-3 px-0")}>
          <Avatar variant="solid" name={profile.fullName} initials={profile.initials} src={profile.avatarUrl} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">{profile.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
          )}
          <SignOutButton description="You’ll need to sign in again to manage and deploy your websites." />
        </div>
      }
    >
      <SidebarNav items={userNav} collapsed={collapsed} />
    </SidebarShell>
    </>
  );
}
