import Form from "next/form";
import { SearchNormal1 } from "iconsax-reactjs";
import type { SearchParams } from "@/lib/table-query";

/**
 * Toolbar search box. A GET form: Enter puts `?q=…` in the URL, keeps the other filters and
 * goes back to page 1. No client JavaScript needed.
 */
export function TableSearch({
  searchParams,
  placeholder,
  param = "q",
}: {
  searchParams: SearchParams;
  placeholder: string;
  param?: string;
}) {
  const keep = Object.entries(searchParams).filter(([key]) => key !== param && key !== "page");
  const value = searchParams[param];

  return (
    <Form action="" role="search" className="relative w-full max-w-[300px]">
      {keep.flatMap(([key, v]) =>
        (Array.isArray(v) ? v : [v]).map((item, i) =>
          item === undefined ? null : <input key={`${key}-${i}`} type="hidden" name={key} value={item} />,
        ),
      )}
      <SearchNormal1
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-placeholder"
      />
      <input
        type="search"
        name={param}
        aria-label={placeholder}
        placeholder={placeholder}
        defaultValue={Array.isArray(value) ? value[0] : value}
        className="h-10 w-full rounded-full border border-input bg-background pr-4 pl-10 text-[13px] text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25"
      />
    </Form>
  );
}
