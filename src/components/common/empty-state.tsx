import type { ReactNode } from "react";

/** Empty list or empty search result in a dashed box: icon, one line of title, a hint, optional action. */
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
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/45 bg-primary-soft/50 px-6 py-8 text-center">
      <span
        aria-hidden
        className="mb-1 grid size-12 place-items-center rounded-full bg-background text-brand shadow-card ring-1 ring-primary/20 [&_svg]:size-6"
      >
        {icon}
      </span>
      <p className="font-heading text-base font-semibold text-foreground">
        {title}
      </p>
      {description && (
        <p className="text-[13px] text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
