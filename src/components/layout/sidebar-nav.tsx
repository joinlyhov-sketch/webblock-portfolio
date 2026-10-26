"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Element3, Global, MessageQuestion, Setting5 } from "iconsax-reactjs";
import type { ReactNode } from "react";
import type { NavIcon, NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

const icons: Record<NavIcon, ReactNode> = {
  websites: <Global />,
  templates: <Element3 />,
  settings: <Setting5 />,
  support: <MessageQuestion />,
};

function isActive(pathname: string, item: NavItem) {
  if (pathname === item.href) return true;
  return !item.exact && pathname.startsWith(`${item.href}/`);
}

export function SidebarNav({ items, collapsed }: { items: NavItem[]; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1.5">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              item.icon
                ? "h-[42px] rounded-full px-3 [&_svg]:size-[18px] [&_svg]:shrink-0"
                : "rounded-md px-3 py-2 font-medium",
              collapsed && "justify-center px-0",
              active
                ? "bg-brand-soft font-semibold text-brand-deep"
                : "font-medium text-foreground-soft hover:bg-surface hover:text-foreground",
            )}
          >
            {item.icon && <span aria-hidden>{icons[item.icon]}</span>}
            <span className={cn(collapsed && "sr-only")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
