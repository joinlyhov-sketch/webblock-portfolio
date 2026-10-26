import type { ComponentProps, ReactNode } from "react";
import { ArrowDown2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./input";

type SelectProps = ComponentProps<"select"> & {
  /** Icon shown inside the field, on the left. */
  icon?: ReactNode;
  /** Extra classes for the icon holder. */
  iconClassName?: string;
};

/** Styled native select: keyboard, screen reader and mobile pickers work for free. */
export function Select({ className, icon, iconClassName, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      {icon && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-y-0 left-4 flex items-center text-foreground [&_svg]:size-[18px]", iconClassName)}
        >
          {icon}
        </span>
      )}
      <select
        className={cn(fieldClasses, "cursor-pointer appearance-none pr-10", icon && "pl-11", className)}
        {...props}
      >
        {children}
      </select>
      <ArrowDown2
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-foreground"
      />
    </div>
  );
}
