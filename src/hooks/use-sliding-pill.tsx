"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

type PillBox = { left: number; top: number; width: number; height: number };

/**
 * Sliding highlight for segmented tabs. The container gets `ref` and `relative`; every tab carries
 * `data-tab={index}`. `pill` is the active tab's box, measured after layout and re-measured whenever
 * the container or the tab resizes. It stays `undefined` until then (server render, first paint), so
 * a tab should paint its own highlight while `pill` is missing and let the pill take over after.
 * Pass `existingRef` when the container already has a ref of its own.
 */
export function useSlidingPill<T extends HTMLElement = HTMLElement>(
  activeIndex: number,
  layoutKey?: string | number,
  existingRef?: RefObject<T | null>,
) {
  const ownRef = useRef<T>(null);
  const ref = existingRef ?? ownRef;
  const [pill, setPill] = useState<PillBox>();
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const container = ref.current;
    const tab = container?.querySelector<HTMLElement>(`[data-tab="${activeIndex}"]`);
    if (!container || !tab) return;
    const place = () => setPill({ left: tab.offsetLeft, top: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight });
    place();
    const observer = new ResizeObserver(place);
    observer.observe(container);
    observer.observe(tab);
    return () => observer.disconnect();
  }, [ref, activeIndex, layoutKey]);

  // Place the pill without animating on the first paint; only later moves slide.
  useEffect(() => {
    if (!pill || animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [pill, animate]);

  return { ref, pill, animate };
}

/** The highlight itself: style it with `className` (background, shadow). Reduced motion jumps instead of sliding. */
export function SlidingPill({
  pill,
  animate,
  className,
}: {
  pill: PillBox | undefined;
  animate: boolean;
  className?: string;
}) {
  if (!pill) return null;
  return (
    <span
      aria-hidden
      style={{ width: pill.width, height: pill.height, transform: `translate(${pill.left}px, ${pill.top}px)` }}
      className={cn(
        "pointer-events-none absolute top-0 left-0 rounded-full will-change-transform",
        animate && "motion-safe:transition-[transform,width,height] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
    />
  );
}
