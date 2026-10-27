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
  MessageQuestion,
  Monitor,
  Profile2User,
  Setting5,
  Shop,
} from "iconsax-reactjs";
import type { NavIcon, NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

const ICONS = {
  overview: Activity,
  users: Profile2User,
  subscriptions: Card,
  monitoring: Monitor,
  websites: Global,
  templates: Element3,
  settings: Setting5,
  support: MessageQuestion,
  products: Box,
  business: Shop,
  monitor: Activity,
} satisfies Record<NavIcon, ComponentType<{ className?: string }>>;

function isActive(pathname: string, item: NavItem) {
  if (pathname === item.href) return true;
  return !item.exact && pathname.startsWith(`${item.href}/`);
}

type Mode = {
  /** Smaller rows (Admin Portal sidebar). */
  compact?: boolean;
  /** Icons only, labels kept for screen readers (collapsed user and owner sidebars). */
  collapsed?: boolean;
};

const itemClass = (active: boolean, { compact, collapsed }: Mode) =>
  cn(
    "flex w-full items-center gap-3 rounded-full px-3 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
    compact ? "h-9 text-[13px]" : "h-[42px] text-sm",
    collapsed && "justify-center px-0",
    active
      ? cn("bg-brand-soft font-semibold", compact ? "text-brand-strong" : "text-brand-deep")
      : cn("font-medium text-foreground-soft hover:text-foreground", compact ? "hover:bg-muted" : "hover:bg-surface"),
  );

export function SidebarNav({ items, compact = false, collapsed = false }: { items: NavItem[] } & Mode) {
  const pathname = usePathname();
  const mode = { compact, collapsed };

  return (
    <nav aria-label="Main" className={cn("flex flex-col", compact ? "gap-1" : "gap-1.5")}>
      {items.map((item) =>
        item.children ? (
          <NavGroup key={item.href} item={item} pathname={pathname} mode={mode} />
        ) : (
          <NavLink key={item.href} item={item} active={isActive(pathname, item)} mode={mode} />
        ),
      )}
    </nav>
  );
}

function NavLink({ item, active, mode }: { item: NavItem; active: boolean; mode: Mode }) {
  const Icon = item.icon ? ICONS[item.icon] : null;
  return (
    <Link
      href={item.href}
      title={mode.collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={itemClass(active, mode)}
    >
      {Icon && <Icon aria-hidden className={cn("shrink-0", mode.compact ? "size-4" : "size-[18px]")} />}
      <span className={cn(mode.collapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
}

/** Item with sub-pages: a toggle button, open while one of its pages is showing. */
function NavGroup({ item, pathname, mode }: { item: NavItem; pathname: string; mode: Mode }) {
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
        className={cn(itemClass(false, mode), inside && "text-foreground")}
      >
        {Icon && <Icon aria-hidden className={cn("shrink-0", mode.compact ? "size-4" : "size-[18px]")} />}
        <span className="flex-1 text-left">{item.label}</span>
        <ArrowRight2
          aria-hidden
          className={cn("size-4 transition-transform duration-150", (open || inside) && "rotate-90")}
        />
      </button>
      {(open || inside) && (
        <div id={listId} className="mt-1 ml-[21px] flex flex-col gap-1 border-l border-border pl-3">
          {item.children?.map((child) => (
            <NavLink key={child.href} item={child} active={isActive(pathname, child)} mode={mode} />
          ))}
        </div>
      )}
    </div>
  );
}
