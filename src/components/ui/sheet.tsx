"use client";

import type { ComponentProps } from "react";
import { CloseSquare } from "iconsax-reactjs";
import { Dialog as SheetPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** shadcn/ui sheet (Radix Dialog sliding in from the side). Used for the mobile nav. */
export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { side?: "left" | "right" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-foreground/40 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-[min(20rem,85vw)] flex-col gap-4 bg-background shadow-card",
          side === "right" &&
            "right-0 border-l border-border data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right",
          side === "left" &&
            "left-0 border-r border-border data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Close"
          className="absolute top-4 right-4 rounded-md text-muted-foreground opacity-0 outline-none transition-[transform,opacity,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closed]:scale-90 data-[state=closed]:opacity-0 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transition-none"
        >
          <CloseSquare variant="Outline" aria-hidden className="size-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
