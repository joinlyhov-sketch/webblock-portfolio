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

const itemClass = (active: boolean) =>
  cn(
    "flex h-[42px] w-full items-center gap-3 rounded-full px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
    active
      ? "bg-brand-soft font-semibold text-brand-strong"
      : "font-medium text-foreground-soft hover:bg-muted hover:text-foreground",
  );

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {items.map((item) =>
        item.children ? (
          <NavGroup key={item.href} item={item} pathname={pathname} />
        ) : (
          <NavLink key={item.href} item={item} active={isActive(pathname, item)} />
        ),
      )}
    </nav>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon ? ICONS[item.icon] : null;
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
      {Icon && <Icon aria-hidden className="size-[18px] shrink-0" />}
      {item.label}
    </Link>
  );
}

/** Item with sub-pages: a toggle button, open while one of its pages is showing. */
function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
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
        className={cn(itemClass(false), inside && "text-foreground")}
      >
        {Icon && <Icon aria-hidden className="size-[18px] shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        <ArrowRight2
          aria-hidden
          className={cn("size-4 transition-transform duration-150", (open || inside) && "rotate-90")}
        />
      </button>
      {(open || inside) && (
        <div id={listId} className="mt-1 ml-[21px] flex flex-col gap-1 border-l border-border pl-3">
          {item.children?.map((child) => (
            <NavLink key={child.href} item={child} active={isActive(pathname, child)} />
          ))}
        </div>
      )}
    </div>
  );
}
