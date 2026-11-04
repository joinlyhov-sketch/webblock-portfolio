"use client";

import type { ComponentProps } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Add } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

// shadcn/ui dialog primitives. Use `common/modal` or `common/confirm-dialog` for screens.

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({
  className,
  children,
  showClose = true,
  side = "center",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean;
  side?: "center" | "right";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[7px] motion-safe:animate-fade-in motion-safe:data-[state=closed]:animate-fade-out" />
      <DialogPrimitive.Content
        data-mobile-sheet
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-background outline-none",
          side === "center" && [
            "top-1/2 left-1/2 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-border shadow-popover",
            "motion-safe:animate-pop-in motion-safe:data-[state=closed]:animate-pop-out",
          ],
          side === "right" && [
            "top-0 right-0 h-dvh max-h-dvh border-l border-border shadow-2xl",
            "data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right motion-reduce:animate-none",
          ],
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-full border border-border bg-background text-foreground-soft shadow-button transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Add variant="Outline" aria-hidden className="size-5 rotate-45" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
