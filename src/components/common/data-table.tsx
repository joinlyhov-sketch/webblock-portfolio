import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowSwapVertical, ArrowUp } from "iconsax-reactjs";
import { TablePagination } from "@/components/common/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Page } from "@/lib/api/types";
import { parseTableQuery, tableHref, type SearchParams, type TableQuery } from "@/lib/table-query";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  /** Unique per table. */
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** API sort field. Makes the header a link that toggles `?sort=<field>,asc|desc`. */
  sortField?: string;
  /** Static icon after the header text (e.g. a filter glyph). */
  headerIcon?: ReactNode;
  /** Width / alignment for the whole column, e.g. "w-40 text-right". */
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: Page<T>;
  rowKey: (row: T) => string;
  /** The page's resolved `searchParams` — pagination and sort links keep every other param. */
  searchParams: SearchParams;
  /** Plural noun for the footer: "Showing 1–9 of 14 {itemLabel}". */
  itemLabel: string;
  /** Singular noun for the footer when there is exactly one item. Defaults to `itemLabel`. */
  itemLabelOne?: string;
  /** Accessible name of the table, e.g. "User accounts". */
  label: string;
  /** Title row above the toolbar. */
  heading?: ReactNode;
  /** Search, filters and actions shown above the table. */
  toolbar?: ReactNode;
  /** Shown when there are no items at all (use `EmptyState` when it exists). */
  empty?: ReactNode;
  /** Sort applied when the URL has none; its header shows as active. */
  defaultSort?: TableQuery["sort"];
  /** `false` for a short preview table (e.g. a dashboard widget): no pagination footer. */
  footer?: boolean;
  /** Smallest table width, e.g. "min-w-[960px]". Narrower screens scroll the table sideways. */
  minWidth?: string;
  /** Extra row classes, e.g. "relative cursor-pointer" for rows with a stretched link. */
  rowClassName?: string;
  /**
   * Stretch to the bottom of a flex-column parent (the Admin `<main>`). Never shorter than 420px —
   * below that the page scrolls. (Same as `className="flex-1"` plus that minimum.)
   */
  fill?: boolean;
  /** Denser rows and smaller text (Admin Portal): 48px rows, 12px text, smaller badges and avatars. */
  compact?: boolean;
  className?: string;
};

/**
 * Every list screen's table ("Draft table style"): "No." first column, sortable headers,
 * pinned footer with "Showing …" + pagination. Only real rows are drawn (no empty filler rows). The card
 * takes the height its parent gives it (e.g. `flex-1`), whatever the row count: spare room stays blank
 * above the footer, and when there are too many rows only the rows scroll while the toolbar, the column
 * headers and the footer stay in place.
 * A Server Component — page, size and sort live in the URL (see `lib/table-query`).
 *
 * @example
 * const query = parseTableQuery(await searchParams);
 * const users = await listUsers(query);
 * <DataTable
 *   label="User accounts" itemLabel="accounts" data={users} searchParams={await searchParams}
 *   rowKey={(u) => u.id}
 *   columns={[
 *     { key: "name", header: "Account", sortField: "name", cell: (u) => u.fullName },
 *     { key: "joined", header: "Joined", sortField: "joinedAt", cell: (u) => formatDate(u.joinedAt) },
 *   ]}
 * />
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchParams,
  itemLabel,
  itemLabelOne,
  label,
  heading,
  toolbar,
  empty,
  defaultSort,
  footer = true,
  minWidth,
  rowClassName,
  fill = false,
  compact = false,
  className,
}: DataTableProps<T>) {
  const { sort } = parseTableQuery(searchParams, { sort: defaultSort });
  const offset = data.page * data.size;
  const isEmpty = data.items.length === 0;

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-border bg-background shadow-table",
        fill && "min-h-[420px] flex-1",
        className,
      )}
    >
      {heading && <div className="shrink-0 px-4 pt-5 pb-1">{heading}</div>}
      {toolbar && (
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center gap-2.5 border-b border-border px-4",
            compact ? "py-2.5 [&_button]:h-8 [&_button]:text-xs [&_input]:h-8 [&_input]:text-xs" : "py-3.5",
          )}
        >
          {toolbar}
        </div>
      )}

      <Table
        aria-label={label}
        className={cn(
          minWidth,
          compact &&
            cn(
              "text-xs [&_td]:h-12 [&_td]:py-1.5 [&_th]:text-[11px] [&_td_.text-xs]:text-[11px]",
              // Smaller badges, avatars and thumbnails inside rows.
              "[&_[data-badge]]:h-5 [&_[data-badge]]:px-1.5 [&_[data-badge]]:text-[11px] [&_[data-badge]_svg]:size-3",
              "[&_[data-avatar]]:size-7 [&_[data-avatar]]:text-[10px] [&_[data-thumb]]:size-7",
            ),
        )}
        // Empty: the table is just its header row, and the message below takes the free space.
        containerClassName={cn("overscroll-contain", isEmpty ? "shrink-0" : "min-h-0 grow")}
      >
        {/* Sticky header: under border-collapse the row border scrolls away, so draw it as a shadow. z-20 keeps
            it above raised cells (e.g. row menus over a stretched row link). */}
        <TableHeader className="sticky top-0 z-20 shadow-[inset_0_-1px_0_var(--color-border)]">
          <TableRow className="border-0">
            <TableHead className={cn("h-auto w-[77px] pr-0 pl-[21px] leading-normal", compact ? "py-2.5" : "py-3")}>
              No.
            </TableHead>
            {columns.map((column) => {
              const active = sort && column.sortField === sort.field ? sort.direction : undefined;
              return (
                <TableHead
                  key={column.key}
                  className={cn("h-auto leading-normal", compact ? "py-2.5" : "py-3", column.className)}
                  aria-sort={active === "asc" ? "ascending" : active === "desc" ? "descending" : undefined}
                >
                  {column.sortField ? (
                    <SortLink field={column.sortField} active={active} searchParams={searchParams}>
                      {column.header}
                    </SortLink>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      {column.header}
                      {column.headerIcon}
                    </span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        {!isEmpty && (
          <TableBody>
            {data.items.map((row, i) => (
              <TableRow
                key={rowKey(row)}
                className={cn("hover:bg-muted/70 motion-safe:animate-row-in", rowClassName)}
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <TableCell className="pr-0 pl-[21px] tabular-nums">{offset + i + 1}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {/* Outside the (possibly wider-than-screen) table, so it stays centred in the visible area. */}
      {isEmpty && (
        <div className="flex min-h-64 flex-1 items-center justify-center px-6 py-10 text-center">
          {data.totalItems > 0 ? (
            <p className="text-muted-foreground">
              This page is empty.{" "}
              <Link href={tableHref(searchParams, { page: null })} className="font-medium text-primary hover:underline">
                Go to the first page
              </Link>
            </p>
          ) : (
            (empty ?? <p className="text-muted-foreground">No {itemLabel} yet.</p>)
          )}
        </div>
      )}

      {footer && (
        <div className="shrink-0 border-t border-border">
          <TablePagination data={data} searchParams={searchParams} itemLabel={itemLabel} itemLabelOne={itemLabelOne} />
        </div>
      )}
    </section>
  );
}

/** Header link: inactive → asc → desc → asc… Changing sort goes back to page 1. */
function SortLink({
  field,
  active,
  searchParams,
  children,
}: {
  field: string;
  active?: "asc" | "desc";
  searchParams: SearchParams;
  children: ReactNode;
}) {
  const next = active === "asc" ? "desc" : "asc";
  const Icon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowSwapVertical;

  return (
    <Link
      href={tableHref(searchParams, { sort: `${field},${next}`, page: null })}
      scroll={false}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/40",
        active ? "text-primary" : "hover:text-foreground",
      )}
    >
      {children}
      <Icon
        aria-hidden
        className={cn(
          "transition-[opacity,transform] duration-150",
          active ? "size-3 opacity-100" : "size-3.5 opacity-80 group-hover:opacity-100",
        )}
      />
      <span className="sr-only">
        {active ? `, sorted ${active === "asc" ? "ascending" : "descending"}` : ", sort"}
      </span>
    </Link>
  );
}

/** Loading state for loading.tsx: same frame as DataTable with pulsing rows. */
export function DataTableSkeleton({ columns = 5, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading table"
      className="overflow-hidden rounded-[20px] border border-border bg-background shadow-table"
    >
      <div className="h-11 border-b border-border bg-muted" />
      <div className="animate-pulse">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex h-[68px] items-center gap-6 border-b border-border px-5 last:border-0">
            {Array.from({ length: columns }, (_, c) => (
              <div key={c} className={cn("h-3.5 rounded-full bg-surface", c === 0 ? "w-6" : "flex-1")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
