"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SegmentedTab = {
  label: string;
  href: string;
  /** Set for tabs that filter by a search param (`?release=FAILED`); otherwise matched by pathname. */
  active?: boolean;
};

/** Pill segmented tabs. Each tab is a link, so the active tab lives in the URL. */
export function SegmentedTabs({
  tabs,
  className,
  size = "md",
}: {
  tabs: SegmentedTab[];
  className?: string;
  /** "sm" for table toolbars (13px). */
  size?: "md" | "sm";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "mb-6 inline-flex rounded-full border border-border bg-surface p-1",
        className,
      )}
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
              "rounded-full font-medium whitespace-nowrap transition-colors",
              size === "sm" ? "px-3 py-[3px] text-xs" : "px-4 py-1.5 text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
