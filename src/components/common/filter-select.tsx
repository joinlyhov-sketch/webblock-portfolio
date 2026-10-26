"use client";

import { ArrowDown2 } from "iconsax-reactjs";
import { useUrlParam } from "@/hooks/use-url-param";
import { cn } from "@/lib/utils";

type FilterSelectProps = {
  /** Text before the value, e.g. "Category:". */
  label: string;
  /** URL search param the choice is stored in. */
  param: string;
  /** Currently applied value; "" means the default option. */
  value: string;
  options: { value: string; label: string }[];
  className?: string;
};

/** Pill dropdown that stores its choice in the URL ("Category: All", "Plan: All", "Rows 10"). */
export function FilterSelect({ label, param, value, options, className }: FilterSelectProps) {
  const { setParam, pending } = useUrlParam();

  return (
    <label
      className={cn(
        "relative inline-flex h-[34px] items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-[13px] leading-[19.5px] font-medium text-foreground-soft transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/25",
        pending && "opacity-70",
        className,
      )}
    >
      <ArrowDown2 aria-hidden className="pointer-events-none size-3.5 shrink-0" />
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => setParam(param, event.target.value || null)}
        aria-label={label.replace(/:$/, "")}
        className="cursor-pointer appearance-none bg-transparent pr-0.5 font-medium outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
