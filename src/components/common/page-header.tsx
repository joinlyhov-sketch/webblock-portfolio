import type { ReactNode } from "react";

/** Page title (accent colour), one-line description, and actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[30px] leading-[34.5px] font-semibold tracking-[-0.6px] text-primary">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-1.5">{actions}</div>}
    </header>
  );
}
