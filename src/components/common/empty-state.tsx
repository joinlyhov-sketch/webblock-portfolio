import type { ReactNode } from "react";

/** Empty list or empty search result: icon, one line of title, a hint, optional action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 py-6 text-center">
      <span aria-hidden className="mb-1 grid size-12 place-items-center rounded-full bg-brand-soft text-brand [&_svg]:size-6">
        {icon}
      </span>
      <p className="font-heading text-base font-semibold text-foreground">{title}</p>
      {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
