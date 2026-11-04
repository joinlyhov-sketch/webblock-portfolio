"use client";

import type { KeyboardEvent, PointerEvent } from "react";

export type Hsv = { h: number; s: number; v: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function hexToHsv(hex: string): Hsv {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

/** Reads a 0..1 position from a pointer event over `el`. */
function position(e: PointerEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
  };
}

function drag(e: PointerEvent<HTMLElement>, onMove: (e: PointerEvent<HTMLElement>) => void) {
  e.currentTarget.setPointerCapture(e.pointerId);
  onMove(e);
}

/** Saturation / brightness square plus a hue slider. Minimal, rounded, no native dialog. */
export function ColorArea({ value, onChange }: { value: Hsv; onChange: (next: Hsv) => void }) {
  const areaKeys = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const next = { ...value };
    if (e.key === "ArrowLeft") next.s = clamp(value.s - step, 0, 1);
    else if (e.key === "ArrowRight") next.s = clamp(value.s + step, 0, 1);
    else if (e.key === "ArrowUp") next.v = clamp(value.v + step, 0, 1);
    else if (e.key === "ArrowDown") next.v = clamp(value.v - step, 0, 1);
    else return;
    e.preventDefault();
    onChange(next);
  };

  const hueKeys = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 4;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const h = clamp(value.h + (e.key === "ArrowRight" ? step : -step), 0, 360);
    onChange({ ...value, h });
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(value.s * 100)}%, brightness ${Math.round(value.v * 100)}%`}
        aria-valuenow={Math.round(value.s * 100)}
        onKeyDown={areaKeys}
        onPointerDown={(e) =>
          drag(e, (ev) => {
            const { x, y } = position(ev);
            onChange({ ...value, s: x, v: 1 - y });
          })
        }
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          const { x, y } = position(e);
          onChange({ ...value, s: x, v: 1 - y });
        }}
        style={{ backgroundColor: `hsl(${value.h} 100% 50%)` }}
        className="relative h-32 w-full cursor-crosshair touch-none rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent" />
        <span
          aria-hidden
          style={{ left: `${value.s * 100}%`, top: `${(1 - value.v) * 100}%`, backgroundColor: hsvToHex(value) }}
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-button"
        />
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(value.h)}
        onKeyDown={hueKeys}
        onPointerDown={(e) => drag(e, (ev) => onChange({ ...value, h: position(ev).x * 360 }))}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) onChange({ ...value, h: position(e).x * 360 });
        }}
        style={{
          background:
            "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
        }}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <span
          aria-hidden
          style={{ left: `${(value.h / 360) * 100}%`, backgroundColor: `hsl(${value.h} 100% 50%)` }}
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-button"
        />
      </div>
    </div>
  );
}
