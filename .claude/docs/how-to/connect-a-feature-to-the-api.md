<!-- What: the teammate workflow for moving a feature from mock data to the real backend.
     Related: skills/connect-feature-to-api, API_TRACKING.md, docs/backend-services-list.md -->

# How to connect a feature to the API

> Parts marked *(after setup)* need the shared API plumbing and tracking script (Phases 1–2 of the plan).

## Once per person
1. Get the latest `dev` safely: `pnpm sync-dev` (never a plain `git pull` or VS Code's Sync button —
   `sync-dev` checks for force-pushes and the malware signs from the earlier attack first).
2. `pnpm install`.
3. Copy `.env.example` to `.env.local` and fill in `BACKEND_API_URL` (the gateway address, from the team
   chat) and `API_STATUS_NAME=<your-name>`, so your real calls get recorded *(recording: after Phase 2)*.
4. `pnpm dev`, sign in with **your own test account** on the dev backend. Deletes there are real.

## For each feature
1. **Pick.** In `API_TRACKING.md`, choose a feature with ⚪ Not connected rows and add your name to its
   Owner line (or tell the team).
2. **Ask Claude.** `/connect-feature-to-api products`, or just "fetch the products from the real API".
   Claude makes the branch `feature/products-api` from the latest `dev`, connects each `api.ts` function
   whose endpoint exists, leaves the rest on mock, and keeps the UI unchanged.
3. **Test in the browser.** Open the pages; list, add, edit, delete.

   | You see | Do |
   |---|---|
   | Works, data looks right | Nothing — it will show ✅ |
   | Error, or the page breaks | `/debug-issue <what happened>` |
   | 404 / endpoint doesn't exist | Leave it — it stays 🔴 Needed for the backend |
   | Works but data looks wrong | Note it; usually the spec is outdated — ask Claude to compare with the real response |

4. *(after setup)* **Look at the tracking file:** `pnpm api:track` (0 tokens). Don't commit
   `API_TRACKING.md` — only your `api-status/<your-name>.json` diary and the code.
5. **Hand in.** `/prepare-pull-request`, commit, push your branch, tell the repo manager
   "ready, branch `feature/products-api`".

## Repo manager
- Before pulling a teammate's branch: ask Claude to `/check-project feature/products-api`
  (read-only malware check first, then the full checks).
- Pull it into `dev` with `pnpm sync-dev feature/products-api`.
- *(after setup)* Rebuild and commit `API_TRACKING.md` on `dev` (`pnpm api:track`, or automatically via
  the local post-merge hook).

**Auth goes first:** until sign-in uses the real backend, no other feature has a login token to send.

## Never commit
| Don't put in the repo | Why |
|---|---|
| Backend addresses, Swagger links, tokens, Keycloak secrets | They belong in your `.env.local` (git-ignored) |
| Test account passwords — not even in docs or Notes | Anyone with repo access could log in |
| Real API responses pasted into mocks, tests or docs | They contain real people's data |
| Real names, emails or phone numbers in `API_TRACKING.md` Notes or commit messages | Same reason |
| Screenshots or `.playwright-mcp/` recordings of the app | They capture whatever the page shows (already git-ignored) |

`/check-project` scans every file git would commit for keys and tokens, but it can't recognise someone's
real email in a note — that part is on us.
