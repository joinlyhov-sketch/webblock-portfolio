"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Logout, SidebarLeft } from "iconsax-reactjs";
import { signOutAction } from "@/features/auth/actions";
import { Avatar } from "@/components/common/avatar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { userNav } from "@/config/nav";
import { useProfileUpdates } from "@/hooks/use-profile-updates";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";
import type { Profile, SidebarSummary } from "@/features/account";
import { BottomNav } from "./bottom-nav";
import { BrandLogo } from "./brand-logo";
import { MobileHeader } from "./mobile-header";
import { SidebarNav } from "./sidebar-nav";
import { TrialCard } from "./trial-card";

/** Interactive part of the user sidebar: collapse toggle and the log out confirmation. */
export function AppSidebarShell({
  profile: serverProfile,
  summary,
}: {
  profile: Pick<Profile, "fullName" | "initials" | "email" | "avatarUrl">;
  summary: SidebarSummary;
}) {
  const profile = useProfileUpdates(serverProfile);
  const { narrow, collapsed, toggle } = useSidebarCollapse();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

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
    <aside
      className={cn(
        // Same frame as the Owner Portal sidebar, whose collapse animation is the reference.
        "sticky top-0 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-background px-4 pt-5 pb-4 transition-[width] duration-200 ease-out motion-reduce:transition-none max-lg:hidden",
        narrow ? "w-[84px]" : "w-[260px]",
      )}
    >
      <div className={cn("flex items-center pb-5", collapsed ? "justify-center" : "justify-between pl-1")}>
        {collapsed ? (
          <button
            type="button"
            aria-label="Expand sidebar"
            title="Expand sidebar"
            aria-expanded={false}
            onClick={toggle}
            className="group/toggle flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs outline-none transition-[color,background-color,border-color,transform] hover:scale-105 hover:border-brand/40 hover:bg-brand-soft hover:text-brand-deep focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <SidebarLeft variant="Outline" aria-hidden className="size-5 rotate-180 transition-transform duration-200 group-hover/toggle:translate-x-0.5" />
          </button>
        ) : (
          <>
            <BrandLogo href="/websites" />
            <button
              type="button"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              aria-expanded={true}
              onClick={toggle}
              className="group/toggle flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-soft outline-none transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-deep focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <SidebarLeft variant="Outline" aria-hidden className="size-4 transition-transform duration-200 group-hover/toggle:-translate-x-0.5" />
            </button>
          </>
        )}
      </div>

      <SidebarNav items={userNav} collapsed={collapsed} />

      <div className="mt-auto flex flex-col">
        {/* Fades and folds away (grid rows 1fr → 0fr) instead of vanishing. */}
        <div
          inert={collapsed}
          aria-hidden={collapsed}
          className={cn(
            "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            collapsed ? "grid-rows-[0fr] -translate-y-1 opacity-0" : "grid-rows-[1fr] translate-y-0 opacity-100",
          )}
        >
          <div className="min-h-0 min-w-[228px] overflow-hidden pb-3 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none">
            <TrialCard summary={summary} />
          </div>
        </div>
        <div className="py-2.5">
          <div className="h-px bg-border" />
        </div>
        <div className={cn("flex items-center gap-2.5 pr-1 pl-2", collapsed && "flex-col p-0")}>
          <Avatar name={profile.fullName} initials={profile.initials} src={profile.avatarUrl} className="size-[34px] text-xs" />
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
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground-soft outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Logout variant="Outline" aria-hidden className="size-[18px]" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => startSignOut(() => signOutAction())}
        loading={signingOut}
        icon={<Logout variant="Outline" />}
        title="Log out of WebBlock?"
        description="You’ll need to sign in again to manage and deploy your websites."
        confirmLabel="Log out"
        look="soft"
      />
    </aside>
    </>
  );
}
