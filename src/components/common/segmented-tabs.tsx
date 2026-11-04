"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft2, ArrowRight2 } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SegmentedTab = {
  label: string;
  href?: string;
  /** Client-side tab: renders a button that calls this instead of navigating (no reload). */
  onSelect?: () => void;
  /** Number shown after the label (e.g. websites per status). */
  count?: number;
  /** Set when the active tab comes from the URL query instead of the path (`?status=live`). */
  active?: boolean;
};

const VARIANT = {
  /** White pill on a grey track (app screens). */
  track: {
    nav: "w-fit max-w-full items-center self-start overflow-x-auto bg-segment-track [scrollbar-width:none]",
    active: "bg-background font-semibold text-brand-deep shadow-tab",
    idle: "font-medium text-muted-foreground hover:text-foreground",
  },
  /** Blue filled pill in a bordered track (admin portal). */
  filled: {
    nav: "mb-6 border border-border bg-surface",
    active: "bg-primary font-medium text-primary-foreground",
    idle: "font-medium text-muted-foreground hover:text-foreground",
  },
} as const;

/**
 * Pill segmented tabs. Each tab is a link, so the active tab lives in the URL: the path by default,
 * or the page decides with `active` when tabs are query filters (`?status=live`).
 *
 * With `visible`, the track is never wider than its first `visible` tabs. When there are more, the rest
 * slide in with the ‹ › buttons (or a swipe / trackpad scroll), and the active tab is kept in view.
 */
export function SegmentedTabs({
  tabs,
  label,
  variant = "track",
  size = "md",
  visible,
  className,
}: {
  tabs: SegmentedTab[];
  /** Accessible name of the tab group. */
  label?: string;
  variant?: keyof typeof VARIANT;
  /** "sm" for compact table toolbars (13px, h-8). */
  size?: "md" | "sm";
  /** Most tabs shown at once; more than this makes the track a slider. */
  visible?: number;
  className?: string;
}) {
  const pathname = usePathname();
  const v = VARIANT[variant];
  const isActive = (tab: SegmentedTab) => tab.active ?? (tab.href !== undefined && pathname === tab.href);

  const sliding = visible !== undefined && tabs.length > visible;
  const navRef = useRef<HTMLElement>(null);
  // Track width that fits exactly the first `visible` tabs, and whether there is more to either side.
  const [maxWidth, setMaxWidth] = useState<number>();
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    setEdges({
      start: nav.scrollLeft <= 1,
      end: nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!sliding || !nav || visible === undefined) return;
    const measure = () => {
      const last = nav.children[visible - 1] as HTMLElement | undefined;
      if (last) setMaxWidth(last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(nav).paddingRight));
      updateEdges();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [sliding, visible, tabs.length, updateEdges]);

  // Bring the active tab into view when it is chosen from elsewhere (e.g. a shared link). Re-runs once
  // the width limit is set, since before that every tab still fits.
  const activeIndex = tabs.findIndex(isActive);
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.children[activeIndex] as HTMLElement | undefined;
    if (!sliding || !nav || !tab || maxWidth === undefined) return;
    if (tab.offsetLeft < nav.scrollLeft || tab.offsetLeft + tab.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      showTab(nav, tab, tab.offsetLeft < nav.scrollLeft ? "start" : "end");
    }
  }, [sliding, activeIndex, maxWidth]);

  /** Moves by whole tabs: the first tab cut off in that direction becomes the first (or last) one shown. */
  function slide(direction: 1 | -1) {
    const nav = navRef.current;
    if (!nav) return;
    const items = [...nav.children] as HTMLElement[];
    const target =
      direction === 1
        ? items.find((t) => t.offsetLeft + t.offsetWidth > nav.scrollLeft + nav.clientWidth + 1)
        : items.findLast((t) => t.offsetLeft < nav.scrollLeft - 1);
    if (target) showTab(nav, target, direction === 1 ? "start" : "end");
  }

  // Fade the side(s) that have more tabs, so a half-shown tab reads as "more this way".
  const fade = sliding && !(edges.start && edges.end)
    ? `linear-gradient(to right, ${edges.start ? "black" : "transparent"}, black 24px, black calc(100% - 24px), ${edges.end ? "black" : "transparent"})`
    : undefined;

  const nav = (
    <nav
      ref={navRef}
      aria-label={label}
      onScroll={sliding ? updateEdges : undefined}
      style={sliding ? { maxWidth, maskImage: fade, WebkitMaskImage: fade } : undefined}
      className={cn(
        "inline-flex rounded-full",
        size === "sm" ? "h-8 p-0.5" : "p-1",
        v.nav,
        // `relative` makes the tabs' offsetLeft count from the track; min-w-0 lets it shrink on small screens.
        sliding && "relative min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = isActive(tab);
        const tabClass = cn(
          "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
          size === "sm" ? "h-7 px-3.5 text-[13px] leading-none" : variant === "track" ? "h-9 min-w-[100px] px-4 text-sm leading-[21px]" : "px-4 py-1.5 text-sm",
          active ? v.active : v.idle,
        );
        const content = (
          <>
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
          </>
        );
        return tab.onSelect || tab.href === undefined ? (
          <button key={tab.label} type="button" aria-pressed={active} onClick={tab.onSelect} className={tabClass}>
            {content}
          </button>
        ) : (
          <Link key={tab.href} href={tab.href} scroll={false} aria-current={active ? "page" : undefined} className={tabClass}>
            {content}
          </Link>
        );
      })}
    </nav>
  );

  if (!sliding) return nav;

  return (
    <div className="flex max-w-full min-w-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Show previous tabs"
        disabled={edges.start}
        onClick={() => slide(-1)}
        className="shrink-0"
      >
        <ArrowLeft2 variant="Outline" aria-hidden />
      </Button>
      {nav}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Show more tabs"
        disabled={edges.end}
        onClick={() => slide(1)}
        className="shrink-0"
      >
        <ArrowRight2 variant="Outline" aria-hidden />
      </Button>
    </div>
  );
}

/** Scrolls the track so `tab` sits at its start or end edge (the browser clamps at either end). */
function showTab(nav: HTMLElement, tab: HTMLElement, align: "start" | "end") {
  const style = getComputedStyle(nav);
  const left =
    align === "start"
      ? tab.offsetLeft - parseFloat(style.paddingLeft)
      : tab.offsetLeft + tab.offsetWidth + parseFloat(style.paddingRight) - nav.clientWidth;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  nav.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
}
