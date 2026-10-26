import { cn } from "@/lib/utils";

/**
 * Thin progress bar, 6px tall. `value` is 0–100.
 * `card` = gradient fill on a tinted track (billing cards), `solid` = flat brand fill (dialogs).
 */
export function Progress({
  value,
  label,
  variant = "card",
  className,
}: {
  value: number;
  /** Accessible name, e.g. "Trial progress". */
  label: string;
  variant?: "card" | "solid";
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const solid = variant === "solid";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        "h-1.5 w-full overflow-hidden",
        solid ? "rounded-[3px] bg-track" : "rounded-full bg-primary/18",
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-[width]",
          solid ? "rounded-[3px] bg-brand" : "rounded-full bg-linear-to-r from-usage-from to-primary",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
