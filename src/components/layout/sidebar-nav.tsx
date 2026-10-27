"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight2,
  Box,
  Card,
  Element3,
  Global,
  InfoCircle,
  Monitor,
  Profile2User,
  Setting2,
} from "iconsax-reactjs";
import type { NavIcon, NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

const ICONS = {
  overview: Activity,
  users: Profile2User,
  websites: Global,
  subscriptions: Card,
  monitoring: Monitor,
  templates: Element3,
  settings: Setting2,
  products: Box,
  info: InfoCircle,
} satisfies Record<NavIcon, ComponentType<{ className?: string }>>;

function isActive(pathname: string, item: NavItem) {
  if (pathname === item.href) return true;
  return !item.exact && pathname.startsWith(`${item.href}/`);
}

const itemClass = (active: boolean, compact = false) =>
  cn(
    "flex w-full items-center gap-3 rounded-full px-3 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
    compact ? "h-9 text-[13px]" : "h-[42px] text-sm",
    active
      ? "bg-brand-soft font-semibold text-brand-strong"
      : "font-medium text-foreground-soft hover:bg-muted hover:text-foreground",
  );

export function SidebarNav({
  items,
  compact = false,
}: {
  items: NavItem[];
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col", compact ? "gap-1" : "gap-1.5")}>
      {items.map((item) =>
        item.children ? (
          <NavGroup
            key={item.href}
            item={item}
            pathname={pathname}
            compact={compact}
          />
        ) : (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(pathname, item)}
            compact={compact}
          />
        ),
      )}
    </nav>
  );
}

function NavLink({
  item,
  active,
  compact = false,
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
}) {
  const Icon = item.icon ? ICONS[item.icon] : null;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={itemClass(active, compact)}
    >
      {Icon && (
        <Icon
          aria-hidden
          className={cn("shrink-0", compact ? "size-4" : "size-[18px]")}
        />
      )}
      {item.label}
    </Link>
  );
}

/** Item with sub-pages: a toggle button, open while one of its pages is showing. */
function NavGroup({
  item,
  pathname,
  compact = false,
}: {
  item: NavItem;
  pathname: string;
  compact?: boolean;
}) {
  const inside = isActive(pathname, item);
  const [open, setOpen] = useState(inside);
  const Icon = item.icon ? ICONS[item.icon] : null;
  const listId = `nav-group-${item.href.replace(/\W+/g, "-")}`;

  return (
    <div>
      <button
        type="button"
        aria-expanded={open || inside}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(itemClass(false, compact), inside && "text-foreground")}
      >
        {Icon && (
          <Icon
            aria-hidden
            className={cn("shrink-0", compact ? "size-4" : "size-[18px]")}
          />
        )}
        <span className="flex-1 text-left">{item.label}</span>
        <ArrowRight2
          aria-hidden
          className={cn(
            "size-4 transition-transform duration-150",
            (open || inside) && "rotate-90",
          )}
        />
      </button>
      {(open || inside) && (
        <div
          id={listId}
          className="mt-1 ml-[21px] flex flex-col gap-1 border-l border-border pl-3"
        >
          {item.children?.map((child) => (
            <NavLink
              key={child.href}
              item={child}
              active={isActive(pathname, child)}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
