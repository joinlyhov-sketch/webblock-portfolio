"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Below `md` the sidebars become an off-canvas drawer. Desktop is unchanged: these classes only
 * apply under `md`. Closes on route change and on Esc.
 */
export function useMobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Close when the route changes (adjusting state while rendering, not in an effect).
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return { open, setOpen };
}

/** Classes for the `<aside>`: fixed and slid off-screen under `md` until the drawer is open. */
export const drawerClass = (open: boolean) =>
  cn(
    "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[260px] max-md:shadow-float max-md:transition-[transform,visibility] max-md:duration-300 max-md:ease-[cubic-bezier(0.32,0.72,0,1)] max-md:motion-reduce:transition-none",
    open ? "max-md:translate-x-0 max-md:visible" : "max-md:-translate-x-full max-md:invisible",
  );

/** Hamburger button and dark backdrop. Render next to the `<aside>`, never inside it. */
export function MobileDrawerToggle({ open, onOpenChange, controls }: { open: boolean; onOpenChange: (open: boolean) => void; controls: string }) {
  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={controls}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "fixed top-3 left-[15px] z-40 flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-button outline-none transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transition-none md:hidden",
          open && "z-[60] bg-background shadow-float",
        )}
      >
        <span aria-hidden className="relative flex size-5 items-center justify-center">
          <span className={cn("absolute h-[1.75px] w-[18px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none", open ? "translate-y-0 rotate-45" : "-translate-y-[6px]")} />
          <span className={cn("absolute h-[1.75px] w-[18px] rounded-full bg-current transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none", open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100")} />
          <span className={cn("absolute h-[1.75px] w-[18px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none", open ? "translate-y-0 -rotate-45" : "translate-y-[6px]")} />
        </span>
      </button>
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        aria-hidden={!open}
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 transition-opacity duration-300 ease-out motion-reduce:transition-none md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
    </>
  );
}
