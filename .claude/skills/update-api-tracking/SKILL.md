---
name: update-api-tracking
description: Rebuild API_TRACKING.md from the endpoint comments in api.ts files, specs/ and the teammates' call diaries (api-status/), and report what changed. Use when asked to update, refresh or sync the API tracking file or endpoint statuses.
---
<!-- What: refreshes API_TRACKING.md (🔴 Needed / ⚪ Not connected / ✅ Working / ❌ Error).
     Runs: scripts/update-api-tracking.mjs (also `pnpm api:track`, 0 tokens without Claude). -->

1. If `scripts/update-api-tracking.mjs` doesn't exist yet, stop and say: "The tracking script isn't set
   up yet (Phase 2 of the plan)."
2. Run `pnpm api:track`.
3. Report only the script's short summary and the rows that changed status — don't read the whole
   `API_TRACKING.md`.

Only the repo manager commits `API_TRACKING.md` (on `dev`). On a teammate's branch, run it to look,
but don't commit the file — commit only your `api-status/<name>.json` diary.
✅ means the real call succeeded; it doesn't prove the page looks right. Write that in Notes if needed.
