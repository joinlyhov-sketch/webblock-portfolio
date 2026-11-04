"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowDown2, TickCircle } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type FilterOption = {
  label: string;
  href: string;
  active: boolean;
  /** Draw a divider above this option (groups like "All admins" / emails / "System"). */
  separatorBefore?: boolean;
};

/**
 * Toolbar filter dropdown: "Status: All ▾". Each option is a link, so the filter lives in the URL.
 * Build the hrefs on the server with `tableHref(searchParams, { status: value, page: null })`.
 */
export function FilterMenu({
  label,
  options,
  className,
  valueClassName,
}: {
  label: string;
  options: FilterOption[];
  /** Extra classes for the button (e.g. `h-11` to match a taller toolbar). */
  className?: string;
  /** Extra classes for the value element (e.g. custom max-width). */
  valueClassName?: string;
}) {
  const current = options.find((o) => o.active)?.label ?? "All";
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* No lift or press-scale here: the trigger would jump while the menu opens right under it. */}
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "max-w-[200px] font-medium motion-safe:hover:translate-y-0 motion-safe:active:scale-100 data-[state=open]:border-primary/40 data-[state=open]:bg-muted",
            className,
          )}
          title={`${label}: ${current}`}
        >
          <ArrowDown2 variant="Outline" aria-hidden className="shrink-0" />
          <span className="flex min-w-0 items-center gap-1">
            <span className="shrink-0">{label}:</span>
            <span className={cn("min-w-0 truncate", valueClassName)}>{current}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px] max-w-[280px]">
        {options.map((option) => (
          <Fragment key={option.label}>
            {option.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem asChild>
              <Link
                href={option.href}
                scroll={false}
                aria-current={option.active ? "true" : undefined}
                className={cn(option.active && "text-primary")}
                title={option.label}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {option.active && <TickCircle variant="Outline" aria-hidden className="shrink-0" />}
              </Link>
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
