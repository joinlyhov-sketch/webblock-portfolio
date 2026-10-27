"use client";

import type { ComponentProps } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

// shadcn/ui popover primitives: a floating panel anchored to a trigger (e.g. the notifications bell).

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-3xl border border-border bg-background shadow-popover outline-none motion-safe:animate-fade-in",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
