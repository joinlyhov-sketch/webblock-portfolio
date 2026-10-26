import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * WebBlock text field (Figma "Input"). Pair it with a `<label htmlFor>`; set `aria-invalid`
 * when the field has an error so the border turns red.
 *
 * @example
 * <label htmlFor="email">Email</label>
 * <Input id="email" name="email" type="email" aria-invalid={!!error} />
 */
export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-[52px] w-full min-w-0 rounded-[14px] border border-input bg-background px-3.5 text-[15px] text-foreground shadow-button",
        "transition-[border-color,box-shadow] duration-150 ease-out outline-none placeholder:text-placeholder",
        "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/16",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/16",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
