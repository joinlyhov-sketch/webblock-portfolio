---
name: debug-issue
description: Use for any bug, failing build, type error, API call that fails, or unexpected behaviour. Evidence-first debugging - reproduce, form one hypothesis, isolate, then fix.
argument-hint: <bug description or error>
---
<!-- What: step-by-step debugging; no fix before a reproduction. Related: docs/how-to/fix-an-api-mismatch.md -->

Investigate: $ARGUMENTS

Follow these steps in order. Do NOT edit source code before step 3 is complete.

1. **Reproduce.** Find the exact command, route, or input that triggers it, and run it.
   Capture the real error output / stack trace. If `pnpm dev` is running, use the `next-devtools` MCP
   (`nextjs_index` → `nextjs_call`) to read the app's live errors, routes and logs. If you cannot reproduce it, stop and report
   what you tried — do not guess a fix.
2. **Hypothesis.** State one falsifiable cause, citing the specific log line, stack frame or file:line.
3. **Isolate.** Eliminate variables until one point of failure remains: check inputs, data shape vs
   `types.ts` (for real API calls: the actual response vs `types.ts` vs the endpoint in `specs/` — search
   by path, don't read the whole spec), server vs client component boundary, `git diff` / `git log`.
   Show the evidence that rules out the alternatives.
4. **Fix** only that cause, with the smallest change. No unrelated refactors.
5. **Prove.** Re-run the step-1 reproduction and show it now passes, then run `/check-project quick`.

Report: reproduction, root cause (with evidence), fix, before/after output.
