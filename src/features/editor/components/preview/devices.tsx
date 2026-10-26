"use client";

import { useEffect, useRef, useState } from "react";
import { Mobile, Monitor } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type Device = "desktop" | "tablet" | "mobile";

/** Width the website is laid out at (the editor label reads "Desktop 1280"). */
export const DEVICE_WIDTH = { desktop: 1280, tablet: 820, mobile: 390 } satisfies Record<Device, number>;

// iconsax has no tablet glyph: the tablet option uses the phone icon drawn larger.
const DEVICES = [
  { value: "desktop", label: "Desktop", icon: Monitor, iconClass: "size-4" },
  { value: "tablet", label: "Tablet", icon: Mobile, iconClass: "size-[18px]" },
  { value: "mobile", label: "Mobile", icon: Mobile, iconClass: "size-3.5" },
] as const;

/** Figma device toggle. Icons only in the editor top bar, icon + label in Preview. */
export function DeviceSwitcher({
  value,
  onChange,
  withLabels = false,
}: {
  value: Device;
  onChange: (device: Device) => void;
  withLabels?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Device"
      className={cn(
        "flex gap-0.5 border border-border bg-primary-soft p-1",
        withLabels ? "rounded-full" : "rounded-xl",
      )}
    >
      {DEVICES.map((d) => {
        const active = d.value === value;
        return (
          <button
            key={d.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={withLabels ? undefined : d.label}
            title={d.label}
            onClick={() => onChange(d.value)}
            className={cn(
              "flex h-8 items-center justify-center gap-2 text-[13px] font-medium transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              withLabels ? "rounded-full px-5" : "w-10 rounded-[9px]",
              active ? "bg-background text-brand-strong shadow-button" : "text-foreground-soft hover:text-foreground",
            )}
          >
            <d.icon aria-hidden className={d.iconClass} />
            {withLabels && d.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Zoom that fits `width` CSS px into the element's width (never above 1).
 * Used with the CSS `zoom` property so the site lays out at its real device width.
 */
export function useFitZoom<T extends HTMLElement>(width: number, gutter = 48) {
  const ref = useRef<T>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1, Math.max(0.2, (el.clientWidth - gutter) / width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, gutter]);
  return { ref, zoom };
}
