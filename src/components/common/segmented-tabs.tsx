"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SegmentedTab = {
  label: string;
  href: string;
  /** Number shown after the label (e.g. websites per status). */
  count?: number;
  /** Set when the active tab comes from the URL query instead of the path. */
  active?: boolean;
};

/**
 * Pill segmented tabs. Each tab is a link, so the active tab lives in the URL: the path by default,
 * or the page decides with `active` when tabs are query filters (`?status=live`).
 */
export function SegmentedTabs({
  tabs,
  label,
  className,
}: {
  tabs: SegmentedTab[];
  /** Accessible name of the tab group. */
  label?: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className={cn("inline-flex w-fit max-w-full items-center self-start rounded-full bg-segment-track p-1", className)}
    >
      {tabs.map((tab) => {
        const active = tab.active ?? pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-full px-4 text-sm leading-[21px] transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              active
                ? "bg-background font-semibold text-brand-deep shadow-tab"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                  active ? "bg-brand text-primary-foreground" : "bg-background text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
