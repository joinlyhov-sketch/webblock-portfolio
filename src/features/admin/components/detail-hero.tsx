import type { ReactNode } from "react";
import { ExportSquare } from "iconsax-reactjs";
import { HeroDecor } from "@/components/common/hero-decor";
import { cn } from "@/lib/utils";

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
    <div className="relative isolate flex items-center gap-4 overflow-hidden bg-linear-to-b from-primary-soft to-background px-6 pt-6 pb-5">
      <HeroDecor />
      <div className="shrink-0">{media}</div>
      <div className="min-w-0 flex-1 space-y-1.5 pr-8">
        {badge}
        {/* Long website names: at most 2 lines, the full name on hover. */}
        <h2
          title={title}
          className="line-clamp-2 text-[26px] leading-8 font-semibold tracking-[-0.4px] break-words text-foreground"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-soft bg-background px-3 py-1 text-sm font-medium text-brand hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <span className="truncate">{link.label}</span>
            <ExportSquare variant="Outline" aria-hidden className="size-3.5 shrink-0" />
          </a>
        )}
        {chips && <div className="flex flex-wrap gap-1.5 pt-0.5">{chips}</div>}
      </div>
    </div>
  );
}

// HeroDecor moved to components/common so non-admin popups can use it too.
export { HeroDecor };

/** Small outlined chip under the hero title: owner, deploy, email, plan. */
export function HeroChip({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[13px] font-medium text-foreground-soft [&_svg]:size-3.5 [&_svg]:shrink-0">
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
        <h3 className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground">
          {icon && (
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand [&_svg]:size-3.5"
            >
              {icon}
            </span>
          )}
          {title}
        </h3>
        {aside && (
          <span className="text-xs text-muted-foreground">{aside}</span>
        )}
      </header>
      {children}
    </section>
  );
}

/**
 * Bordered section inside a detail popup (Figma user detail): icon chip + bold title + aside in a
 * header row with a divider, then the content.
 */
export function DetailCard({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    // Same card as the Settings screen: 20px corners, soft blue shadow, divider inset from the edges.
    <section className="overflow-hidden rounded-[20px] border border-border bg-background shadow-surface">
      <header className="mx-[15px] flex items-center gap-3 border-b border-border py-3.5">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand [&_svg]:size-[18px]"
        >
          {icon}
        </span>
        <h3 className="flex-1 font-heading text-base leading-6 font-semibold text-foreground">
          {title}
        </h3>
        {aside && (
          <span className="text-xs text-muted-foreground">{aside}</span>
        )}
      </header>
      {/* Same inset as the header, so every divider line in the card stops short of the edges. */}
      <div className="px-[15px]">{children}</div>
    </section>
  );
}

/** Icon + label + value tile inside a DetailCard ("Account ID", "Joined", "Plan"). */
export function InfoTile({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  /** Colours the tile, e.g. by plan with `planTone(plan)`. */
  tone?: { surface: string; chip: string; text: string };
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3",
        tone?.surface ?? "bg-muted",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[10px] [&_svg]:size-[18px]",
          tone?.chip ?? "bg-brand-soft text-brand",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={cn("truncate text-[15px] leading-6 font-medium", tone?.text ?? "text-foreground")}>
          {value}
        </dd>
        {hint && <dd className="truncate text-[13px] text-placeholder">{hint}</dd>}
      </div>
    </div>
  );
}
