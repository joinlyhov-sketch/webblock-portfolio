import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page title (accent colour), one-line description, and actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  compact = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Smaller title and spacing (Admin Portal). */
  compact?: boolean;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4",
        compact ? "mb-4" : "mb-6",
      )}
    >
      <div>
        <h1
          className={cn(
            "font-semibold text-primary",
            compact
              ? "text-2xl leading-8 tracking-[-0.4px]"
              : "text-[30px] leading-[34.5px] tracking-[-0.6px]",
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              compact ? "mt-0.5 text-[13px]" : "mt-1.5 text-[15px]",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-1.5">{actions}</div>}
    </header>
  );
}
