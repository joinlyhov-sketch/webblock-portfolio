import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// shadcn/ui input, styled to the Figma form fields (rounded, neutral border, brand focus ring).

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-placeholder",
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25",
        "aria-invalid:border-danger aria-invalid:ring-danger/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
