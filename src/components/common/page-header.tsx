import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page title (accent colour) with a one-line description and optional actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Pass `mb-0` when the page layout already spaces its children (e.g. `gap-[15px]`). */
  className?: string;
}) {
  return (
    <header className={cn("mb-5 flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        <h1 className="text-[30px] leading-[34.5px] font-semibold tracking-[-0.6px] text-primary">{title}</h1>
        {description && <p className="pt-1.5 text-[15px] leading-[22.5px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
