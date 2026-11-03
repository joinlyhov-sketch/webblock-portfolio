"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type RailItem = { label: string; icon: ReactNode; onClick: () => void };

/** Keeps the panel mounted while its rail and width animate between folded and open states. */
export function PanelFrame({
  open,
  width,
  side,
  rail,
  children,
}: {
  open: boolean;
  width: number;
  side: "left" | "right";
  rail: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="relative grid w-14 shrink-0 grid-cols-1 overflow-hidden rounded-[20px] transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
      style={{ width: open ? width : 56 }}
    >
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "col-start-1 row-start-1 z-10 min-w-0 overflow-hidden transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          open ? "translate-x-0 opacity-100" : side === "left" ? "-translate-x-2 opacity-0" : "translate-x-2 opacity-0",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden={open}
        inert={open}
        className={cn(
          "col-start-1 row-start-1 z-20 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          open ? "pointer-events-none scale-[0.98] opacity-0" : "scale-100 opacity-100",
        )}
      >
        {rail}
      </div>
    </div>
  );
}

/**
 * A folded side panel: a slim strip with the "show panel" icon on top, then one icon per section.
 * Every icon opens the panel again (at its section).
 */
export function PanelRail({
  label,
  show,
  items,
}: {
  /** Accessible name of the panel, e.g. "Page". */
  label: string;
  show: RailItem;
  items: RailItem[];
}) {
  return (
    <nav aria-label={label} className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-[20px] bg-background py-3 shadow-card">
      <RailButton item={show} expanded={false} />
      <span aria-hidden className="my-1 h-px w-6 bg-border" />
      {items.map((item) => (
        <RailButton key={item.label} item={item} />
      ))}
    </nav>
  );
}

function RailButton({ item, expanded }: { item: RailItem; expanded?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={item.label}
      aria-expanded={expanded}
      title={item.label}
      onClick={item.onClick}
    >
      {item.icon}
    </Button>
  );
}
