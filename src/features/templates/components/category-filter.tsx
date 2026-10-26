"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowDown2 } from "iconsax-reactjs";
import type { TemplateCategory, TemplateQuery } from "../types";
import { CATEGORY } from "./categories";

/** Figma "Dropdown · Category filter". The choice lives in the URL (?category=). */
export function CategoryFilter({ query }: { query: TemplateQuery }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="relative flex h-[34px] cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background pr-3 pl-3 text-[13px] font-medium text-foreground shadow-button focus-within:ring-3 focus-within:ring-ring/40">
      <ArrowDown2 aria-hidden className="size-3.5" />
      <span>Category:</span>
      <select
        value={query.category ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams();
          if (query.q) params.set("q", query.q);
          if (e.target.value) params.set("category", e.target.value);
          router.push(params.size ? `${pathname}?${params}` : pathname);
        }}
        className="cursor-pointer appearance-none bg-transparent font-medium outline-none"
      >
        <option value="">All</option>
        {(Object.keys(CATEGORY) as TemplateCategory[]).map((key) => (
          <option key={key} value={key}>
            {CATEGORY[key].label}
          </option>
        ))}
      </select>
    </label>
  );
}
