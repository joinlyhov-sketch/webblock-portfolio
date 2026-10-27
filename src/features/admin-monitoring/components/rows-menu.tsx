import { RowsInput } from "@/components/common/rows-input";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

/** Toolbar "Rows [10]" box: page size lives in the URL (`?size=`). */
export function RowsMenu({ searchParams }: { searchParams: SearchParams }) {
  const { size } = parseTableQuery(searchParams);
  // key: reset the box when the URL size changes (e.g. back button).
  return <RowsInput key={size} searchParams={searchParams} size={size} />;
}
