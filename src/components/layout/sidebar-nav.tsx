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
  Monitor,
  Profile2User,
  Setting5,
  Shop,
} from "iconsax-reactjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavIcon, NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

const ICONS = {
  websites: Global,
  templates: Element3,
  settings: Setting5,
  products: Box,
  business: Shop,
  monitor: Activity,
  overview: Activity,
  users: Profile2User,
  subscriptions: Card,
  monitoring: Monitor,
} satisfies Record<Exclude<NavIcon, "support">, ComponentType<{ className?: string; variant?: "Outline" }>>;

export function isActive(pathname: string, item: NavItem) {
  if (pathname === item.href) return true;
  return !item.exact && pathname.startsWith(`${item.href}/`);
}

const itemClass = (active: boolean, compact = false, collapsed = false) =>
  cn(
    // Square collapsed controls keep the active state circular and align with the logo's tile mark.
    "flex w-full items-center rounded-full transition-[color,background-color,padding,gap] duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transition-none",
    compact ? "h-9 text-[13px]" : "h-[42px] text-sm",
    collapsed
      ? cn("mx-auto justify-center gap-0 px-0", compact ? "size-9" : "size-[42px]")
      : "gap-3 px-3",
    active
      ? "bg-brand-soft font-semibold text-brand-deep"
      : "font-medium text-foreground-soft hover:bg-muted hover:text-foreground",
  );

/**
 * Sidebar links. `collapsed` shows icons only (labels stay for screen readers); `compact` is the
 * denser admin size. Items with `children` become an expandable group.
 */
export function SidebarNav({
  items,
  collapsed = false,
  compact = false,
}: {
  items: NavItem[];
  collapsed?: boolean;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("flex flex-col", compact ? "gap-1" : "gap-1.5")}>
      {items.map((item) =>
        item.children ? (
          <NavGroup key={item.href} item={item} pathname={pathname} compact={compact} collapsed={collapsed} />
        ) : (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(pathname, item)}
            compact={compact}
            collapsed={collapsed}
          />
        ),
      )}
    </nav>
  );
}

export function NavIconGlyph({ item, compact = false }: { item: NavItem; compact?: boolean }) {
  if (item.icon === "support") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={cn("shrink-0", compact ? "size-4" : "size-5")}
      >
        <path d="M4 12v-.5a8 8 0 0 1 16 0V12M4 11.5h2.5v6H5a1 1 0 0 1-1-1v-5Zm16 0h-2.5v6H19a1 1 0 0 0 1-1v-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 16.5v2a2 2 0 0 0 2 2h1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9.5" y="19.5" width="4" height="2.5" rx="1.25" fill="currentColor" />
      </svg>
    );
  }

  const Icon = item.icon ? ICONS[item.icon] : null;
  return Icon ? <Icon variant="Outline" aria-hidden className={cn("shrink-0", compact ? "size-4" : "size-5")} /> : null;
}

function NavLink({
  item,
  active,
  compact = false,
  collapsed = false,
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={itemClass(active, compact, collapsed)}
    >
      {item.icon ? (
        <span className={cn("flex shrink-0 items-center justify-center", compact ? "size-4" : "size-5")}>
          <NavIconGlyph item={item} compact={compact} />
        </span>
      ) : null}
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

/**
 * Item with sub-pages: a toggle button, open while one of its pages is showing. In the collapsed
 * rail the sub-pages (which have no icons) open as a flyout menu beside the icon instead.
 */
function NavGroup({
  item,
  pathname,
  compact = false,
  collapsed = false,
}: {
  item: NavItem;
  pathname: string;
  compact?: boolean;
  collapsed?: boolean;
}) {
  const inside = isActive(pathname, item);
  const [open, setOpen] = useState(inside);
  const listId = `nav-group-${item.href.replace(/\W+/g, "-")}`;
  const expanded = open || inside;

  if (collapsed) return <CollapsedNavGroup item={item} pathname={pathname} inside={inside} compact={compact} />;

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(itemClass(false, compact), inside && "text-foreground")}
      >
        {item.icon ? (
          <span className={cn("flex shrink-0 items-center justify-center", compact ? "size-4" : "size-5")}>
            <NavIconGlyph item={item} compact={compact} />
          </span>
        ) : null}
        <span className="flex-1 text-left">{item.label}</span>
        <ArrowRight2 variant="Outline" aria-hidden className={cn("size-4 transition-transform duration-150", expanded && "rotate-90")} />
      </button>
      {/* Slides open/closed (grid rows 0fr ⇄ 1fr) instead of popping; `inert` keeps hidden links out of Tab. */}
      <div
        inert={!expanded}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* Padding offset by negative margin: room for the links' focus ring inside the clip. */}
        <div className="-mx-1 -mb-1 overflow-hidden px-1 pb-1">
          <div id={listId} className="mt-1 ml-[21px] flex flex-col gap-1 border-l border-border pl-3">
            {item.children?.map((child) => (
              <NavLink key={child.href} item={child} active={isActive(pathname, child)} compact={compact} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Collapsed rail version of a group: the icon opens its sub-pages in a menu to the right. */
function CollapsedNavGroup({
  item,
  pathname,
  inside,
  compact,
}: {
  item: NavItem;
  pathname: string;
  inside: boolean;
  compact: boolean;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={item.label}
          aria-label={item.label}
          className={cn(itemClass(inside, compact, true), "data-[state=open]:bg-muted")}
        >
          {item.icon ? (
            <span className={cn("flex shrink-0 items-center justify-center", compact ? "size-4" : "size-5")}>
              <NavIconGlyph item={item} compact={compact} />
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={12} className="min-w-[200px]">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{item.label}</DropdownMenuLabel>
        {item.children?.map((child) => {
          const active = isActive(pathname, child);
          return (
            <DropdownMenuItem
              key={child.href}
              asChild
              className={cn(active && "bg-brand-soft font-semibold text-brand-deep focus:bg-brand-soft focus:text-brand-deep")}
            >
              <Link href={child.href} aria-current={active ? "page" : undefined}>
                {child.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
