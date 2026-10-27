import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

/** Shared frame for the three sidebars: brand on top, nav below, optional footer pinned to the bottom. */
export function SidebarShell({
  label,
  homeHref,
  children,
  footer,
}: {
  label?: string;
  homeHref: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className="sticky top-0 flex h-dvh w-[260px] shrink-0 flex-col gap-1.5 border-r border-border bg-background px-4 py-[22px]">
      <Link href={homeHref} className="mb-4 flex items-center gap-2.5 rounded-lg px-2 pt-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
        <LogoMark />
        <span>
          <span className="block font-heading text-xl leading-[30px] font-bold tracking-[-0.4px] text-foreground">
            {siteConfig.name}
          </span>
          {label && <span className="-mt-1 block text-xs text-muted-foreground">{label}</span>}
        </span>
      </Link>
      {children}
      {footer && <div className="mt-auto border-t border-border pt-2.5">{footer}</div>}
    </aside>
  );
}

/** WebBlock app icon: four rounded blocks on the brand colour. */
function LogoMark() {
  return (
    <span aria-hidden className="grid size-8 shrink-0 grid-cols-2 gap-[3px] rounded-[9px] bg-brand p-[7px] shadow-page-active">
      <span className="rounded-[2.5px] bg-background" />
      <span className="rounded-[2.5px] bg-background/65" />
      <span className="rounded-[2.5px] bg-background/80" />
      <span className="rounded-[2.5px] bg-background" />
    </span>
  );
}
