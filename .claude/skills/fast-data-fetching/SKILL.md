---
name: fast-data-fetching
description: Vercel's React/Next.js rules for fast server-side data fetching - no request waterfalls (Promise.all, start early / await late), Suspense streaming, React.cache dedup, small props to client components, no shared module state. Use when connecting api.ts to the real backend, or writing pages, layouts or Server Actions that load data.
license: MIT
---
<!-- What: performance rules for loading data, picked from Vercel's react-best-practices skill
     (vercel-labs/agent-skills @1a2c79d, MIT) — only the 13 rules about data fetching on the server.
     Related: skills/connect-feature-to-api, rules/structure-pages-and-routes.md -->

# Fast data fetching (from Vercel Engineering)

Open only the rule file you need (`rules/<name>.md`); each has a wrong and a right example.

## 1. No waterfalls (CRITICAL)
- `async-parallel` — independent calls → `Promise.all()`, never one `await` after another
- `async-api-routes` — in Server Actions/route handlers, start promises early, await late
- `async-dependencies` — partial dependencies: chain with `.then()` inside `Promise.all()`
- `async-defer-await` — move an `await` into the branch that actually needs it
- `async-cheap-condition-before-await` — check cheap sync conditions before awaiting remote values
- `async-suspense-boundaries` — let the page shell render; stream slow parts inside `<Suspense>`

## 2. Server side (HIGH)
- `server-parallel-fetching` — sibling async Server Components fetch in parallel; don't await in the parent
- `server-parallel-nested-fetching` — per-item chains: `ids.map(id => get(id).then(next))`
- `server-no-shared-module-state` — never keep request/user data in module-level variables
- `server-serialization` — pass client components only the fields they use
- `server-dedup-props` — don't send the same data twice in different shapes
- `server-cache-react` — `React.cache()` to dedupe non-`fetch` work within one request
- `server-after-nonblocking` — `after()` for work that shouldn't delay the response

## WebBlock notes (these win over the examples)
- **Login check first.** Every Server Action still starts with `require*()` (`rules/structure-server-actions.md`),
  even when the examples validate or fetch first.
- **No new packages without asking.** `async-dependencies` mentions `better-all`; use its
  "without extra dependencies" version (`.then()` + `Promise.all`).
- **`apiClient` uses `fetch`**, which Next.js already dedupes per request — `React.cache()` is only for
  non-fetch work (e.g. reading the session for `requireUser()` in both a layout and a page).
- **Never cache user data across requests.** (Vercel's cross-request LRU rule was left out on purpose.)
- **Loading / empty / error states** still exist for every list screen; Suspense fallbacks use the
  existing skeletons (`DataTableSkeleton`, route `loading.tsx`).
- **Mock `api.ts` files keep data in `globalThis`** — fine for mocks only. Real `apiClient` code must not
  keep tokens or responses in module scope (`server-no-shared-module-state`).
