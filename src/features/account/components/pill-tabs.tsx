"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidingPill, useSlidingPill } from "@/hooks/use-sliding-pill";
import { cn } from "@/lib/utils";

export type PillTab = {
  label: string;
  href?: string;
  /** Client-side tab: a button that calls this instead of navigating (no reload). */
  onSelect?: () => void;
  active?: boolean;
};

/**
 * Segmented pill tabs from the Settings design. `lg` is the Profile/Billing switch (108 × 36),
 * `sm` is the All/Paid/Expired filter (88 × 28). A tab is a link (the choice lives in the URL) or, with `onSelect`, a button.
 */
export function PillTabs({
  tabs,
  label,
  size = "lg",
}: {
  tabs: PillTab[];
  label: string;
  size?: "lg" | "sm";
}) {
  const pathname = usePathname();
  const large = size === "lg";
  const activeIndex = tabs.findIndex((tab) => tab.active ?? (tab.href !== undefined && pathname === tab.href));
  // A tab link can take a moment to answer, so the clicked tab shows as active at once. It is only
  // trusted while the real active tab is still the one it was clicked from.
  const [picked, setPicked] = useState<{ index: number; from: number }>();
  const shownIndex = picked && picked.from === activeIndex ? picked.index : activeIndex;
  const { ref, pill, animate } = useSlidingPill<HTMLElement>(shownIndex, size);

  return (
    <nav
      ref={ref}
      aria-label={label}
      className={cn("relative inline-flex w-fit max-w-full items-end self-start rounded-full bg-segment", large ? "p-1" : "gap-0.5 p-[3px]")}
    >
      <SlidingPill pill={pill} animate={animate} className="bg-background shadow-segment" />
      {tabs.map((tab, index) => {
        const active = index === shownIndex;
        const tabClass = cn(
          "relative inline-flex items-center justify-center rounded-full px-[18px] text-sm leading-[21px] outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/40",
          large ? "h-9 w-[108px]" : "h-7 w-[88px]",
          active
            ? cn("font-semibold text-brand-deep", !pill && "bg-background shadow-segment")
            : "font-medium text-muted-foreground hover:text-foreground",
        );
        return tab.onSelect || tab.href === undefined ? (
          <button
            key={tab.label}
            type="button"
            data-tab={index}
            aria-pressed={active}
            onClick={() => {
              setPicked({ index, from: activeIndex });
              tab.onSelect?.();
            }}
            className={tabClass}
          >
            {tab.label}
          </button>
        ) : (
          <Link
            key={tab.label}
            href={tab.href}
            scroll={false}
            data-tab={index}
            aria-current={active ? "page" : undefined}
            onClick={() => setPicked({ index, from: activeIndex })}
            className={tabClass}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
