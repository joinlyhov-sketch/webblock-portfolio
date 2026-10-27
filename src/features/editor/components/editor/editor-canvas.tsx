"use client";

import { Puck } from "@puckeditor/core";
import { DEVICE_WIDTH, useFitZoom, type Device } from "../preview/devices";

const DEVICE_LABEL = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" } satisfies Record<Device, string>;

/**
 * Centre canvas: the page laid out at the real device width, zoomed to fit (Figma
 * "sugarandcrumb.webblock.com · Desktop 1280 · 100%"). The site uses container queries, so it
 * responds to this width rather than the browser window.
 */
export function EditorCanvas({ device, domain }: { device: Device; domain: string | null }) {
  const width = DEVICE_WIDTH[device];
  const { ref, zoom } = useFitZoom<HTMLDivElement>(width);

  return (
    <div ref={ref} className="bg-dot-grid relative flex min-w-0 flex-1 flex-col items-center overflow-y-auto rounded-[20px] px-6 pt-4 pb-10">
      <div className="flex w-full items-center justify-between pb-2 text-xs text-muted-foreground" style={{ maxWidth: width * zoom }}>
        <span className="truncate">
          {domain ?? "Not deployed yet"} · {DEVICE_LABEL[device]} {width}
        </span>
        <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
      </div>
      {/* The zoom is applied by SiteRoot (inside the preview) through these variables, not here:
          Puck positions its selection overlays inside the preview, so zooming an outer box would
          scale them twice. */}
      <div
        className="shrink-0 overflow-hidden rounded-2xl border border-border bg-background shadow-card"
        style={{ width: width * zoom, "--canvas-zoom": zoom, "--canvas-width": `${width}px` } as React.CSSProperties}
      >
        <Puck.Preview id="website-canvas" />
      </div>
    </div>
  );
}
