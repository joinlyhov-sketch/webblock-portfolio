import type { ReactNode } from "react";
import { ExportSquare } from "iconsax-reactjs";

/**
 * Top of every admin detail popup (user, website, subscription): picture on the left,
 * status pill, big name, link and info chips on a soft brand band.
 */
export function DetailHero({
  media,
  badge,
  title,
  subtitle,
  link,
  chips,
}: {
  media: ReactNode;
  badge?: ReactNode;
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
  chips?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 bg-primary-soft/70 px-6 pt-6 pb-5">
      <div className="shrink-0">{media}</div>
      <div className="min-w-0 flex-1 space-y-1.5 pr-8">
        {badge}
        <h2 className="text-[26px] leading-8 font-semibold tracking-[-0.4px] break-words text-foreground">{title}</h2>
        {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-soft bg-background px-3 py-1 text-[13px] font-medium text-brand hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <span className="truncate">{link.label}</span>
            <ExportSquare aria-hidden className="size-3.5 shrink-0" />
          </a>
        )}
        {chips && <div className="flex flex-wrap gap-1.5 pt-0.5">{chips}</div>}
      </div>
    </div>
  );
}

/** Small outlined chip under the hero title: owner, deploy, email, plan. */
export function HeroChip({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground-soft [&_svg]:size-3.5 [&_svg]:shrink-0">
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Section heading inside a detail popup. */
export function DetailSection({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <header className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          {icon && (
            <span aria-hidden className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand [&_svg]:size-3.5">
              {icon}
            </span>
          )}
          {title}
        </h3>
        {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
      </header>
      {children}
    </section>
  );
}
