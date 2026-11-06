---
name: new-feature
description: Create a brand-new feature folder in src/features by copying the websites reference feature (api.ts with mock data, actions, optional service, schemas, types, components, route page). Use when asked to add a new feature, screen area or module.
argument-hint: <feature-name> [route path]
---
<!-- What: scaffolds a new feature the same way as src/features/websites. Related: rules/structure-feature-folders.md -->

Create the feature `$ARGUMENTS`.

1. Read `src/features/websites/` fully first. It is the reference — match its patterns, naming and
   file shape. For `schemas.ts` follow the zod style of `src/features/auth/schemas.ts` instead of the
   hand-written checks in websites.
2. Ask (only if not obvious from the request) which entity fields the screen needs. Do not invent
   fields beyond what the screen shows.
3. Create, in this order:
   1. `types.ts` — entity type in API DTO shape (camelCase, UUID string id, ISO dates, `string` prices).
   2. `src/mocks/<entity>.ts` — 6–12 typed records incl. edge cases (null image, long name, empty field).
      Images as `/mock/...` URL strings.
   3. `api.ts` — async read/write functions with the future Spring signature; lists return `Page<T>`;
      not found throws `ApiError`. Put `// endpoint: <service> <METHOD> <path>` above each function
      (the endpoint it will need), so `API_TRACKING.md` can list it.
   4. `schemas.ts` — zod schemas for any form.
   5. `service.ts` — only if there is real logic (form parsing beyond one schema, image checks,
      combining several api calls into one view). See `.claude/rules/structure-feature-folders.md`.
   6. `actions.ts` — only if the screen writes data; follow `.claude/rules/structure-server-actions.md`.
   7. `components/` — reuse `components/common` (DataTable, StatusBadge, Modal, toast…) first.
   8. `index.ts` — public exports.
   9. The route `page.tsx` (thin) plus `loading.tsx` / `error.tsx` if the route group lacks them.
4. Make sure loading, empty and error states exist.
5. Run `/check-project`. Report: files created, functions in `api.ts` (= the endpoints it needs), and
   anything you were unsure about.
