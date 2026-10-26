"use client";

import { useState, useTransition } from "react";
import { Logout, SidebarLeft } from "iconsax-reactjs";
import { signOutAction } from "@/actions/auth-actions";
import { Avatar } from "@/components/common/avatar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { userNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import type { Profile, SidebarSummary } from "@/types/account";
import { BrandLogo } from "./brand-logo";
import { SidebarNav } from "./sidebar-nav";
import { TrialCard } from "./trial-card";

/** Interactive part of the user sidebar: collapse toggle and the log out confirmation. */
export function AppSidebarShell({
  profile,
  summary,
}: {
  profile: Pick<Profile, "fullName" | "initials" | "email" | "avatarUrl">;
  summary: SidebarSummary;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col gap-1.5 border-r border-border bg-background px-4 py-[22px] transition-[width] duration-200",
        collapsed ? "w-[84px]" : "w-[260px]",
      )}
    >
      <div className={cn("flex items-center pt-1 pb-[22px]", collapsed ? "flex-col gap-3" : "justify-between px-2")}>
        <BrandLogo href="/websites" compact={collapsed} />
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <SidebarLeft aria-hidden className="size-4" />
        </button>
      </div>

      <SidebarNav items={userNav} collapsed={collapsed} />

      <div className="mt-auto flex flex-col gap-3">
        {!collapsed && <TrialCard summary={summary} />}
        <div className={cn("flex items-center gap-[7px] border-t border-border py-2.5", collapsed && "flex-col")}>
          <Avatar name={profile.fullName} initials={profile.initials} src={profile.avatarUrl} className="size-9 text-[13px]" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">{profile.fullName}</p>
              <p className="truncate text-xs leading-[18px] text-muted-foreground">{profile.email}</p>
            </div>
          )}
          <button
            type="button"
            aria-label="Log out"
            onClick={() => setConfirmOpen(true)}
            className="flex size-[18px] shrink-0 items-center justify-center rounded-md text-foreground-soft outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Logout aria-hidden className="size-[18px]" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => startSignOut(() => signOutAction())}
        loading={signingOut}
        icon={<Logout />}
        title="Log out of WebBlock?"
        description="You’ll need to sign in again to manage and publish your websites."
        confirmLabel="Log out"
      />
    </aside>
  );
}
