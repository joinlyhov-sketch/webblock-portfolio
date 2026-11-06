---
name: prepare-pull-request
description: Final self-check before handing work to the repo manager - no secrets tracked, full /check-project, reviewer agents, short summary to send. Use when asked to prepare, review or finish changes, or "is my branch ready?".
---
<!-- What: everything to do before telling the repo manager "ready, branch X". Related: skills/check-project -->

1. `git status` and `git diff --stat dev...HEAD`: list what changed. Confirm no `.env*` file or credential
   is tracked or staged (`git ls-files | grep -E "^\.env"` must print nothing).
2. Run `/check-project` (full, includes the build).
3. Ask the `code-reviewer` and `business-rules-checker` agents to review the diff; for API work also
   `api-contract-checker`. Fix the Must-fix findings.
4. API work: your `api-status/<name>.json` diary is included; `API_TRACKING.md` is NOT (the repo manager
   rebuilds it on `dev`).
5. Write a short summary to send with "ready, branch X": what changed and why, files by area,
   endpoints connected / still mock, anything unverified.
   No Claude attribution: no `Co-Authored-By`, no "Generated with" line, no session link.

Do not commit or push. Report the result and let the user do it.
