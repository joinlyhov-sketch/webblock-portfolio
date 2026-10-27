"use client";

import { useState } from "react";
import Form from "next/form";
import { MAX_PAGE_SIZE, type SearchParams } from "@/lib/table-query";

/**
 * "Rows [10]" — type how many rows a table shows. Enter (or leaving the box) puts `?size=` in the URL,
 * keeps the other filters and goes back to page 1. Allowed: 1 to 100.
 */
export function RowsInput({
  searchParams,
  size,
}: {
  searchParams: SearchParams;
  size: number;
}) {
  const [value, setValue] = useState(String(size));
  const keep = Object.entries(searchParams).filter(
    ([key]) => key !== "size" && key !== "page",
  );

  return (
    <Form action="" className="flex items-center gap-2">
      {keep.flatMap(([key, v]) =>
        (Array.isArray(v) ? v : [v]).map((item, i) =>
          item === undefined ? null : (
            <input key={`${key}-${i}`} type="hidden" name={key} value={item} />
          ),
        ),
      )}
      <label htmlFor="table-rows" className="text-[13px] text-placeholder">
        Rows
      </label>
      <input
        id="table-rows"
        name="size"
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_PAGE_SIZE}
        step={1}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          if (value !== String(size)) e.currentTarget.form?.requestSubmit();
        }}
        title={`1 to ${MAX_PAGE_SIZE} rows per page`}
        className="h-9 w-[64px] [appearance:textfield] rounded-full border border-input bg-background text-center text-sm font-medium text-foreground transition-[border-color,box-shadow] outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </Form>
  );
}
