"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ButtonStyleKey, FontKey, PaletteKey, SiteRootProps } from "../../types";
import { siteFontVariables } from "../site/site-fonts";

const PALETTES: { value: PaletteKey; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "lavender", label: "Lavender" },
  { value: "bakery", label: "Bakery" },
  { value: "sage", label: "Sage" },
];
const FONTS: { value: FontKey; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "editorial", label: "Editorial" },
  { value: "clean", label: "Clean" },
  { value: "rounded", label: "Rounded" },
];
const BUTTONS: { value: ButtonStyleKey; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
];

/** Figma option card: soft blue + 1.6px brand border when selected. */
function OptionCard({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-xs outline-none transition-[background-color,border-color] focus-visible:ring-3 focus-visible:ring-ring/40",
        active
          ? "border-[1.6px] border-brand bg-primary-soft font-semibold text-brand-deep"
          : "border border-border bg-background font-medium text-foreground-soft hover:border-primary/40",
      )}
    >
      {children}
      {label}
    </button>
  );
}

/** "Layout & Design · Visual style · Whole site": palette, heading font and button shape. */
export function VisualStyle({
  site,
  onChange,
}: {
  site: SiteRootProps;
  onChange: <K extends "palette" | "font" | "buttonStyle">(name: K, value: SiteRootProps[K]) => void;
}) {
  const palette = site.palette === "original" ? undefined : site.palette;
  return (
    <section className={cn(siteFontVariables, "flex flex-col border-t border-border px-[18px] py-4")}>
      <div className="flex justify-between text-xs text-placeholder">
        <span className="font-medium">Visual style</span>
        <span>Whole site</span>
      </div>

      <p id="vs-palette" className="pt-3 text-[13px] font-semibold text-foreground">
        Color palette
      </p>
      <div role="radiogroup" aria-labelledby="vs-palette" className="grid grid-cols-4 gap-2 pt-2">
        {PALETTES.map((p) => (
          <OptionCard key={p.value} active={site.palette === p.value} label={p.label} onClick={() => onChange("palette", p.value)}>
            <span
              aria-hidden
              data-site-template={site.templateId}
              data-site-palette={p.value === "original" ? undefined : p.value}
              className="flex h-7 w-full overflow-hidden rounded-2xl border border-border"
            >
              <span className="flex-1 bg-site-accent" />
              <span className="flex-1 bg-site-accent-soft" />
              <span className="flex-1 bg-site-ink" />
            </span>
          </OptionCard>
        ))}
      </div>
      <div
        data-site-template={site.templateId}
        data-site-palette={palette}
        className="flex gap-2 pt-2.5"
        aria-label="Current colours"
      >
        {(
          [
            ["Accent", "bg-site-accent"],
            ["Background", "bg-site-bg"],
            ["Text", "bg-site-ink"],
          ] as const
        ).map(([label, swatch]) => (
          <span key={label} className="flex flex-1 items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-1.5 text-xs text-foreground">
            <span aria-hidden className={cn("size-[18px] shrink-0 rounded-[5px] border border-border", swatch)} />
            {label}
          </span>
        ))}
      </div>

      <p id="vs-font" className="pt-4 text-[13px] font-semibold text-foreground">
        Font
      </p>
      <div role="radiogroup" aria-labelledby="vs-font" className="grid grid-cols-4 gap-2 pt-2">
        {FONTS.map((f) => (
          <OptionCard key={f.value} active={site.font === f.value} label={f.label} onClick={() => onChange("font", f.value)}>
            <span
              aria-hidden
              data-site-template={site.templateId}
              data-site-font={f.value === "original" ? undefined : f.value}
              className="font-site-heading text-xl leading-[30px] font-semibold"
            >
              Aa
            </span>
          </OptionCard>
        ))}
      </div>

      <p id="vs-buttons" className="pt-4 text-[13px] font-semibold text-foreground">
        Buttons
      </p>
      <div role="radiogroup" aria-labelledby="vs-buttons" className="grid grid-cols-3 gap-2 pt-2">
        {BUTTONS.map((b) => {
          const active = site.buttonStyle === b.value;
          return (
            <OptionCard key={b.value} active={active} label={b.label} onClick={() => onChange("buttonStyle", b.value)}>
              <span
                aria-hidden
                data-site-buttons={b.value}
                className={cn("h-5 w-14 rounded-site-button", active ? "bg-brand" : "bg-brand-border")}
              />
            </OptionCard>
          );
        })}
      </div>
    </section>
  );
}
