"use client";

import Link from "next/link";
import { ArrowDown2, TickCircle } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type FilterOption = { label: string; href: string; active: boolean };

/**
 * Toolbar filter dropdown: "Status: All ▾". Each option is a link, so the filter lives in the URL.
 * Build the hrefs on the server with `tableHref(searchParams, { status: value, page: null })`.
 */
export function FilterMenu({ label, options }: { label: string; options: FilterOption[] }) {
  const current = options.find((o) => o.active)?.label ?? "All";
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="font-medium">
          <ArrowDown2 aria-hidden />
          {label}: {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {options.map((option) => (
          <DropdownMenuItem key={option.label} asChild>
            <Link
              href={option.href}
              scroll={false}
              aria-current={option.active ? "true" : undefined}
              className={cn(option.active && "text-primary")}
            >
              <span className="flex-1">{option.label}</span>
              {option.active && <TickCircle aria-hidden />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
