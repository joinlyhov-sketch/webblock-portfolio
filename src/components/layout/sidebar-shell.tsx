import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarLeft } from "iconsax-reactjs";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Sidebar frame (Admin Portal): brand on top, nav below, optional footer pinned to the bottom.
 * With `onToggleCollapsed` it gets the same collapse button as the user sidebar; the owner keeps
 * the `collapsed` state and passes it to the nav and footer too.
 */
export function SidebarShell({
  label,
  homeHref,
  children,
  footer,
  compact = false,
  collapsed = false,
  onToggleCollapsed,
}: {
  label?: string;
  homeHref: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Narrower sidebar with a smaller logo (Admin Portal). */
  compact?: boolean;
  /** Icon-only rail: logo mark, nav icons, footer stacked. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col gap-1.5 border-r border-border bg-background transition-[width] duration-200",
        compact ? "px-3 py-4" : "px-4 py-[22px]",
        collapsed ? "w-[72px]" : compact ? "w-[232px]" : "w-[260px]",
      )}
    >
      <div className={cn("mb-4 flex items-center pt-1", collapsed ? "flex-col gap-3" : "justify-between gap-2")}>
        <Link
          href={homeHref}
          aria-label={collapsed ? siteConfig.name : undefined}
          className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <LogoMark />
          {!collapsed && <Brand label={label} compact={compact} />}
        </Link>
        {onToggleCollapsed && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={onToggleCollapsed}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <SidebarLeft aria-hidden className="size-4" />
          </button>
        )}
      </div>
      {children}
      {footer && (
        <div className="mt-auto border-t border-border pt-2.5">{footer}</div>
      )}
    </aside>
  );
}

/** Wordmark and the portal name under it. */
function Brand({ label, compact }: { label?: string; compact: boolean }) {
  return (
    <span className="min-w-0">
      <span
        className={cn(
          "block font-heading font-bold tracking-[-0.4px] text-foreground",
          compact ? "text-lg leading-7" : "text-xl leading-[30px]",
        )}
      >
        {siteConfig.name}
      </span>
      {label && (
        <span className="-mt-1 block text-xs text-muted-foreground">
          {label}
        </span>
      )}
    </span>
  );
}

/** WebBlock app icon: four rounded blocks on the brand colour. */
function LogoMark() {
  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 grid-cols-2 gap-[3px] rounded-[9px] bg-brand p-[7px] shadow-page-active"
    >
      <span className="rounded-[2.5px] bg-background" />
      <span className="rounded-[2.5px] bg-background/65" />
      <span className="rounded-[2.5px] bg-background/80" />
      <span className="rounded-[2.5px] bg-background" />
    </span>
  );
}
