---
paths:
  - "next.config.ts"
  - "src/app/**/route.ts"
  - "src/lib/api/**"
  - "src/lib/auth/**"
  - "src/features/**/api.ts"
---
<!-- What: how the frontend reaches the 6 backend services safely (server-only URLs and login tokens).
     Loads: when editing api.ts, lib/api, lib/auth or next.config.ts. Enforced by: hooks/check-project-rules.mjs
     (no hardcoded backend addresses, no secrets). Related: api-error-messages.md -->

# API: backend access and security

The backend has **no CORS**: the browser only ever talks to our Next.js app, and only the Next.js server
talks to the backend. Pick the pattern by what the screen needs:

| Need | Pattern |
|---|---|
| Show data on a page | Server Component calls the feature's `api.ts` → pass data as props |
| Create / update / delete | Client component → Server Action (`actions.ts`) → `api.ts` |
| Read from the browser (search-as-you-type, polling, refresh) | Client component → Route Handler (`src/app/**/route.ts`) → `api.ts` |
| ~~Rewrite `/backend/*` straight to the backend~~ | **Not used**: the browser would have to hold the token, and calls would skip `apiClient` |

1. **All backend calls go through `apiClient`** in `src/lib/api/` (via the feature's `api.ts`). Pages,
   components and route handlers never build backend URLs or headers themselves.
2. **Server Actions are for writes only** — they run one at a time as POST, so never use them for reads
   or polling; that's what Route Handlers are for.
3. **Route Handlers are public endpoints** like Server Actions: start with the right login check, call the
   feature's `api.ts`, return only the fields the client needs, and turn `ApiError` into a JSON error with
   the same status. Keep them thin (no business logic).
4. **Backend URLs and tokens are server-only.** Addresses are server env variables — never `NEXT_PUBLIC_`.
   The login token (Keycloak) stays in an httpOnly cookie; the server reads it and `apiClient` sends
   `Authorization: Bearer …`. It never reaches browser JavaScript or rendered HTML.
4. **Payments:** the backend talks to WeBill365. The frontend only shows what the API returns.
