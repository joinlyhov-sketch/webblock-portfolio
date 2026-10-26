"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Lock1 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import type { PageData } from "../../types";
import { SiteRenderer } from "../site-renderer";
import { DEVICE_WIDTH, DeviceSwitcher, useFitZoom, type Device } from "./devices";

/** Bezel per device (Figma "MacBook Pro" / "Tablet device" / "Phone device"). */
const FRAME = {
  desktop: "rounded-[22px] border-[10px] border-b-[18px]",
  tablet: "rounded-[36px] border-[14px]",
  mobile: "rounded-[44px] border-[12px]",
} satisfies Record<Device, string>;

/**
 * Figma "12 Preview" / "08b Template Preview": top bar with back link, device toggle and an action,
 * the page inside a device frame on the dot grid, the address underneath.
 */
export function PreviewShell({
  data,
  backHref,
  backLabel,
  domain,
  badge,
  action,
}: {
  data: PageData;
  backHref: string;
  backLabel: string;
  domain: string;
  /** Floating chip top-left, e.g. "Live preview". */
  badge: string;
  action: ReactNode;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const width = DEVICE_WIDTH[device];
  const { ref, zoom } = useFitZoom<HTMLDivElement>(width + 28, 96);

  return (
    <div className="-m-page flex h-dvh flex-col">
      <header className="relative flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
        <Link
          href={backHref}
          className="flex items-center gap-2 rounded-full px-2 py-1 text-[13px] font-medium text-foreground-soft outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <ArrowLeft aria-hidden className="size-4" /> {backLabel}
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <DeviceSwitcher value={device} onChange={setDevice} withLabels />
        </div>
        {action}
      </header>

      <div ref={ref} className="bg-dot-grid relative flex min-h-0 flex-1 flex-col items-center overflow-hidden px-12 pt-10 pb-6">
        <span className="absolute top-6 left-8 flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
          <span aria-hidden className="size-2.5 rounded-full border-2 border-success-soft bg-success" />
          {badge}
        </span>

        <div
          className={cn("flex min-h-0 flex-1 flex-col overflow-hidden border-foreground bg-foreground shadow-card", FRAME[device])}
          style={{ zoom }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto bg-background" style={{ width }}>
            <SiteRenderer data={data} />
          </div>
        </div>
        {device === "desktop" && (
          <div aria-hidden className="flex flex-col items-center" style={{ zoom }}>
            <span className="h-10 w-44 bg-border" />
            <span className="h-3 w-72 rounded-t-lg bg-border" />
          </div>
        )}

        <p className="mt-4 flex items-center gap-1.5 rounded-full bg-background px-3.5 py-1.5 text-xs font-medium text-foreground shadow-card">
          <Lock1 aria-hidden className="size-3.5 text-muted-foreground" /> {domain}
        </p>
      </div>
    </div>
  );
}
