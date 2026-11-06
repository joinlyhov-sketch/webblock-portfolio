---
name: connect-feature-to-api
description: Connect a feature (or one endpoint) to the real Spring Boot backend - fetch data from the API, replace mock data, wire endpoints in api.ts and actions.ts without changing the UI. Use whenever asked to fetch, connect, integrate, swap or "make it use the real API".
argument-hint: <feature-name> [function or endpoint]
---
<!-- What: the step-by-step way to move a feature from mock data to the real backend.
     Related: docs/how-to/connect-a-feature-to-the-api.md, rules/api-*.md, API_TRACKING.md -->

Connect `$ARGUMENTS` to the real backend. Only `features/<name>/api.ts`, `types.ts` and `actions.ts`
change. Pages and components change only when the backend's data really differs (say so in the summary).

**Preflight.** `src/lib/api/client.ts` (`apiClient`) must exist. If it doesn't, stop and say:
"The shared API plumbing isn't set up yet (Phase 1 of the plan)." Don't write your own fetch code.

0. **Branch.** If `WEBBLOCK_ROLE` is `manager` (`echo $WEBBLOCK_ROLE`), stay on the current branch.
   Otherwise: on `dev` or an old branch with no uncommitted changes → run `pnpm sync-dev`, then
   `git checkout -b feature/<feature>-api` and tell the user. Already on that branch → continue.
   Uncommitted changes elsewhere, or that branch already exists → stop and ask (check the feature's
   Owner line in `API_TRACKING.md`). Never commit or push.
1. **Map.** List each exported function in `api.ts` with its `// endpoint:` comment. Missing comment →
   add one (`// endpoint: <service> <METHOD> <path>`). Search `specs/` for each path (never open a whole
   spec file). Not in `specs/`? Still connect it if the user says the backend has it; otherwise leave it
   on mock — it shows as 🔴 Needed.
2. **Types.** Update `types.ts` to the backend's shape (`rules/api-data-types.md`). Report differences
   from the old mock shape.
3. **api.ts.** Replace mock bodies with `apiClient` calls, one function at a time — functions whose
   endpoint isn't ready stay on mock. Keep each signature, return `Page<T>` for lists
   (`rules/api-pagination.md`), throw `ApiError` on failure. Remove the `@/mocks` import once no function
   uses it; delete a mock file only when nothing imports it. If a page or action now makes several
   real calls, follow the `fast-data-fetching` skill (parallel calls, no waterfalls).
4. **actions.ts.** `require*()` stays the first statement; catch `ApiError` → `message` / `fieldErrors`
   (`rules/api-error-messages.md`); `revalidatePath` for every page showing the data.
5. **Check.** `/check-project quick`. Then ask the user to open the pages in the browser (logged in with a
   test account) so the real calls get recorded, and to run `pnpm api:track`.

Report: functions connected, still on mock (and why), data differences found, anything to tell the backend.
