---
paths:
  - "src/features/**/types.ts"
  - "src/features/**/api.ts"
  - "src/lib/api/**"
---
<!-- What: the exact data formats the Spring Boot API uses (UUID ids, decimal-string money, ISO dates, enums).
     Loads: when editing types.ts, api.ts or lib/api. Enforced by: hooks/check-project-rules.mjs (money). -->

# API: data types

Every type in `types.ts` matches what Spring Boot sends:

- **IDs:** lowercase UUID strings (`"f47ac10b-58cc-4372-a567-0e02b2c3d479"`).
- **Money:** decimal strings (`"19.00"`). Never `number`, never `parseFloat()` / `Number()` on it
  (floating-point rounding). Format only at render with `lib/format.ts`.
- **Dates:** ISO-8601 UTC strings (`"2026-11-05T08:00:00.000Z"`).
- **Enums:** `UPPER_SNAKE_CASE` string unions (`"LIVE"`, `"DRAFT"`, `"FREE_TRIAL"`).
- **Names:** camelCase; optional backend fields as `T | null`.

## Connecting to the real API
- Look the endpoint up in `specs/` by **searching for its path**. Never open a whole spec file (they are large).
- `specs/` can be out of date. If a real response differs from the spec, the real response wins:
  follow it, and note "spec outdated" for that endpoint in `API_TRACKING.md` Notes.
- If the backend sends money as a number, tell the user (backend should send a string). Don't coerce it.
- Don't hide differences with silent fallbacks. If a field is renamed, update the type and its uses.
