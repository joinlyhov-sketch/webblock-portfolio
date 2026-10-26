import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses =
  "h-12 w-full rounded-full border border-input bg-background px-4 text-[15px] text-foreground placeholder:text-placeholder outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-muted disabled:text-placeholder aria-invalid:border-danger aria-invalid:ring-danger/20";

type InputProps = ComponentProps<"input"> & {
  /** Icon shown inside the field, on the left. */
  icon?: ReactNode;
  /** Extra classes for the icon holder, e.g. to move the icon closer to the edge. */
  iconClassName?: string;
};

export function Input({ className, icon, iconClassName, ...props }: InputProps) {
  if (!icon) return <input className={cn(fieldClasses, className)} {...props} />;
  return (
    <div className="relative">
      <span
        aria-hidden
        className={cn("pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground [&_svg]:size-[18px]", iconClassName)}
      >
        {icon}
      </span>
      <input className={cn(fieldClasses, "pl-11", className)} {...props} />
    </div>
  );
}
