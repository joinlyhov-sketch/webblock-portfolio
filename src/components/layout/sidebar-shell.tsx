import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarLeft } from "iconsax-reactjs";
import { Logo, LogoMark } from "@/components/common/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Sidebar frame (Admin Portal): brand on top, nav below, optional footer pinned to the bottom.
 * With `onToggleCollapsed` it gets the same collapse button as the user sidebar; the owner keeps
 * the `collapsed` state and passes it to the nav and footer too.
 */
export function SidebarShell({
  homeHref,
  children,
  footer,
  aboveFooter,
  collapsed = false,
  narrow = collapsed,
  onToggleCollapsed,
  className,
}: {
  /** Extra classes for the sidebar, e.g. `max-lg:hidden` when a bottom nav replaces it on small screens. */
  className?: string;
  homeHref: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Pinned above the footer line, e.g. the user sidebar's trial card. */
  aboveFooter?: ReactNode;
  /** Icon-only rail: logo mark, nav icons, footer stacked. */
  collapsed?: boolean;
  /** Rail width. Defaults to `collapsed`; pass it separately (see `useSidebarCollapse`) to stage the animation. */
  narrow?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col gap-1.5 overflow-hidden border-r border-border bg-background transition-[width] duration-200 ease-out motion-reduce:transition-none",
        // Same frame as the user sidebar: 260px open, 84px icon rail, same padding.
        "px-4 py-[22px]",
        narrow ? "w-[84px]" : "w-[260px]",
        className,
      )}
    >
      <div className={cn("mb-4 flex items-center pt-1", collapsed ? "flex-col gap-3" : "justify-between gap-2")}>
        <Link
          href={homeHref}
          aria-label={collapsed ? siteConfig.name : undefined}
          className="flex min-w-0 items-center rounded-lg px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {collapsed ? <LogoMark className="h-8" /> : <Logo />}
        </Link>
        {onToggleCollapsed && (
          <button
            type="button"
            aria-label={narrow ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!narrow}
            onClick={onToggleCollapsed}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40",
              // In the icon rail it is as wide and as tall as the nav buttons below it.
              collapsed ? "mx-auto size-[42px] -translate-x-[3px]" : "size-8",
            )}
          >
            <SidebarLeft variant="Outline" aria-hidden className={cn("size-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none", narrow && "rotate-180")} />
          </button>
        )}
      </div>
      {children}
      {aboveFooter && <div className="mt-auto">{aboveFooter}</div>}
      {footer && (
        <div className={cn("border-t border-border pt-2.5", !aboveFooter && "mt-auto", aboveFooter && "mt-3")}>{footer}</div>
      )}
    </aside>
  );
}
