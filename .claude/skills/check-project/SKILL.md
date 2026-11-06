---
name: check-project
description: Check the whole project - business rules, typecheck, lint and (full mode) the production build. "/check-project quick" takes seconds; plain "/check-project" also builds. Use before saying a task is done, before committing, and on a teammate's branch before pulling it in.
argument-hint: "[quick]"
---
<!-- What: the one command that checks everything. Runs: by Claude itself (and its quick part automatically
     at the end of every task via hooks/check-before-finish.mjs). Related: hooks/check-project-rules.mjs -->

Mode: `$ARGUMENTS` (`quick` = skip the build; anything else or empty = full).

Run these in order and stop at the first failure:

1. `node .claude/hooks/check-project-rules.mjs --all` — business rules (zero-transaction), import
   boundaries, secrets, money typed as string, Server Action auth. Scans every file in `src/`, so it also
   catches changes made outside Claude.
2. `pnpm typecheck` — TypeScript errors (fast; fails before the slow build would).
3. `pnpm lint` — code quality. `next build` does NOT run ESLint, so this step is never redundant.
4. **Full mode only:** `pnpm build` — catches what the steps above can't: server/client component
   mistakes, pages that crash during pre-rendering, invalid `next.config.ts`, route and CSS errors.

In `quick` mode, say at the end that the build was skipped and a full `/check-project` is still needed
before committing.

If a step fails: fix the cause (not by disabling the rule, adding `any`, `@ts-ignore`,
`eslint-disable`, or rewording code just to dodge a pattern), then re-run from step 1.
Never edit `.claude/hooks/` to make a check pass — if a rule looks wrong, stop and tell me.

**Checking a teammate's branch** (`/check-project <branch>`): FIRST read the incoming changes only
(`git fetch`, then `git diff --stat HEAD...origin/<branch>` and `git show`) and look for the malware signs
listed in `scripts/sync-dev.mjs`. Only if that is clean, run the steps above in a separate worktree —
lint and build execute the branch's `eslint.config.mjs` / `next.config.ts`.

Report as a short table: step · pass/fail/skipped · what you fixed. If something can't be fixed without
a design decision, stop and ask.
