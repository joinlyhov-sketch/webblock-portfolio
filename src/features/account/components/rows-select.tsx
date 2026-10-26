"use client";

import { useUrlParam } from "@/hooks/use-url-param";
import { cn } from "@/lib/utils";

const OPTIONS = ["10", "20", "50"];

/** "Rows [10]" box: how many rows the table shows, stored in the URL as `?size=`. */
export function RowsSelect({ value }: { value: number }) {
  const { setParam, pending } = useUrlParam();

  return (
    <label className={cn("flex items-center gap-2", pending && "opacity-70")}>
      <span className="text-[13px] text-placeholder">Rows</span>
      <select
        value={String(value)}
        onChange={(event) => setParam("size", event.target.value === "10" ? null : event.target.value)}
        aria-label="Rows per page"
        className="h-[34px] w-14 cursor-pointer appearance-none rounded-full border border-border bg-background text-center text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
