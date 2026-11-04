"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { More } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  /** Internal link (e.g. `?user=<id>` to open the detail popup). */
  href?: string;
  /** External link, opens in a new tab. */
  externalHref?: string;
  onSelect?: () => void;
  /** Destructive items are red and get a separator above them. */
  danger?: boolean;
  success?: boolean;
  disabled?: boolean;
};

/**
 * The "⋯" menu at the end of a table row (Figma "Row menu").
 *
 * @example
 * <ActionMenu label={`Actions for ${user.fullName}`} items={[
 *   { label: "View details", icon: <Eye />, href: `?user=${user.id}` },
 *   { label: "Suspend user", icon: <Forbidden2 />, danger: true, onSelect: () => setConfirm(true) },
 * ]} />
 */
export function ActionMenu({
  label,
  items,
}: {
  label: string;
  items: ActionMenuItem[];
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label}>
          <More variant="Outline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, i) => {
          const className = cn(
            item.success &&
              "text-success hover:bg-success-soft hover:text-success focus:bg-success-soft focus:text-success data-[highlighted]:bg-success-soft data-[highlighted]:text-success [&_svg]:text-success!",
            item.danger &&
              "text-danger focus:bg-danger-soft focus:text-danger [&_svg]:text-danger!",
          );
          const content = (
            <>
              {item.icon ?? (item.externalHref && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              ))}
              <span className="flex-1">{item.label}</span>
            </>
          );
          return (
            <Fragment key={item.label}>
              {item.danger && i > 0 && <DropdownMenuSeparator />}
              {item.href ? (
                <DropdownMenuItem
                  asChild
                  className={className}
                  disabled={item.disabled}
                >
                  <Link href={item.href} scroll={false}>
                    {content}
                  </Link>
                </DropdownMenuItem>
              ) : item.externalHref ? (
                <DropdownMenuItem
                  asChild
                  className={className}
                  disabled={item.disabled}
                >
                  <a
                    href={item.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className={className}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
