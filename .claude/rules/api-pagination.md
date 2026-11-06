---
paths:
  - "src/features/**/api.ts"
  - "src/lib/table-query.ts"
  - "src/lib/api/**"
---
<!-- What: page numbers — 1-based in the URL and UI, 0-based in the Spring API.
     Loads: when editing api.ts or table-query.ts. Related: ui-components-and-design.md (DataTable) -->

# API: pagination

Spring Data pages start at 0; the URL (`?page=1`) and the UI start at 1.

- URL → api.ts query: always `parseTableQuery()` from `@/lib/table-query`. Never `Number(page) - 1`
  by hand: it gives `NaN` when `page` is missing or invalid.
- Showing a page number: `data.page + 1`.
- List functions in `api.ts` return `Page<T>` (`{ items, page, size, totalItems }`, `page` 0-based).
  If the backend returns a different shape (Spring's `content` / `number` / `totalElements`, or cursor
  paging), convert it once inside that `api.ts` function. Components never see the backend shape.
- Sort goes to the API as `field,asc|desc` (what `parseTableQuery` already produces).
