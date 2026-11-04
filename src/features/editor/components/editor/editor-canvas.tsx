"use client";

import { useState } from "react";
import { Add, Minus } from "iconsax-reactjs";
import { Puck } from "@puckeditor/core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEVICE_WIDTH, useFitZoom, type Device } from "../preview/devices";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

/**
 * Centre canvas (Figma "10 Editor"): the page card on the dotted backdrop, laid out at the real device
 * width and zoomed to fit. The site uses container queries, so it responds to this width rather than
 * the browser window.
 */
export function EditorCanvas({ device }: { device: Device }) {
  const width = DEVICE_WIDTH[device];
  // Figma leaves a wide band of dotted backdrop on both sides of the page card.
  const { ref, zoom: fitZoom } = useFitZoom<HTMLDivElement>(width, 128);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [zoomInput, setZoomInput] = useState<string | null>(null);
  const [prevWidth, setPrevWidth] = useState(width);

  if (prevWidth !== width) {
    setPrevWidth(width);
    setManualZoom(null);
    setZoomInput(null);
  }

  const zoom = manualZoom ?? fitZoom;

  function commitZoomInput() {
    if (zoomInput === null) return;
    const entered = Number(zoomInput);
    if (!zoomInput.trim() || !Number.isFinite(entered)) {
      setZoomInput(null);
      return;
    }
    setManualZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(entered) / 100)));
    setZoomInput(null);
  }

  return (
    <div ref={ref} className="relative flex min-w-0 flex-1 flex-col overflow-auto px-16 pt-2 pb-10">
      {/* The zoom is applied by SiteRoot (inside the preview) through these variables, not here:
          Puck positions its selection overlays inside the preview, so zooming an outer box would
          scale them twice. */}
      <div
        className="mx-auto shrink-0 overflow-hidden rounded-2xl border border-border bg-background shadow-card transition-[width] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: width * zoom, "--canvas-zoom": zoom, "--canvas-width": `${width}px` } as React.CSSProperties}
      >
        <Puck.Preview id="website-canvas" />
      </div>

      <div
        role="group"
        aria-label="Canvas zoom controls"
        className="absolute right-4 bottom-4 z-30 flex items-center gap-1 rounded-full border border-border bg-background/95 p-1 shadow-card backdrop-blur-sm"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setManualZoom(Math.max(MIN_ZOOM, Number((zoom - ZOOM_STEP).toFixed(2))))}
          className="size-8 rounded-full"
        >
          <Minus variant="Outline" aria-hidden className="size-4" />
        </Button>
        <label className="flex items-center gap-0.5 rounded-md px-1 focus-within:ring-2 focus-within:ring-ring/40">
          <input
            type="number"
            min={MIN_ZOOM * 100}
            max={MAX_ZOOM * 100}
            step={1}
            inputMode="numeric"
            aria-label="Zoom percentage (20 to 200)"
            title="Enter a zoom percentage from 20 to 200"
            value={zoomInput ?? String(Math.round(zoom * 100))}
            onFocus={() => setZoomInput(String(Math.round(zoom * 100)))}
            onChange={(event) => setZoomInput(event.target.value)}
            onBlur={commitZoomInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            className="w-10 bg-transparent text-center text-xs font-semibold tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span aria-hidden className="text-xs font-medium text-muted-foreground">%</span>
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setManualZoom(Math.min(MAX_ZOOM, Number((zoom + ZOOM_STEP).toFixed(2))))}
          className="size-8 rounded-full"
        >
          <Add variant="Outline" aria-hidden className="size-4" />
        </Button>
        <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => setManualZoom(null)}
          disabled={manualZoom === null}
          title="Fit preview to canvas"
          className={cn(
            "rounded-full px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 disabled:text-muted-foreground/60",
            manualZoom !== null && "text-brand-strong",
          )}
        >
          Fit
        </button>
      </div>
    </div>
  );
}
