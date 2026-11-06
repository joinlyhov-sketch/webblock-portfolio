# WebBlock automatic checks (hooks)

Plain Node scripts, so they work the same on Windows, macOS and Linux (no bash or jq needed).
They are wired in `.claude/settings.json`. Claude may not edit this folder (`deny` rule in
`settings.json`) — changes are made by a person.

| File | When it runs | What happens on a problem |
|---|---|---|
| `check-project-rules.mjs --pre` | Before Claude edits a file | Edit is blocked, Claude sees why |
| `check-project-rules.mjs --post` | After Claude edits a file | File is formatted, then Claude is told to fix it |
| `check-project-rules.mjs --all` | `/check-project`, the finish check, or by hand | Lists every violation in `src/`, plus any secret in any other file git would commit (docs, specs, `API_TRACKING.md`, diaries) — replaces the old gitleaks CI scan |
| `check-before-finish.mjs` | When Claude finishes a task (only if code changed) | Project rules + typecheck + lint; Claude must fix failures first |
| `check-safe-pull.mjs` | Before Claude runs a shell command | A plain `git pull` / merge of `origin/*` is blocked; Claude must use `pnpm sync-dev` |
| `check-big-reads.mjs` | Before Claude reads a file | Reading a whole spec file or any text file over 50 KB is blocked; Claude must search it or read part of it (saves usage limits) |

`check-project-rules.mjs` holds every rule: zero-transaction websites, import boundaries, secrets,
money typed as a decimal string, and the login check at the start of every Server Action.
Zero-transaction, import and money rules ignore comments (so `// no cart here` is fine).
Secret rules also check comments, because a key pasted in a comment is still leaked.

There is no GitHub CI (free Actions minutes run out): every check runs locally.

## Tests (`tests/`) — one file per rule, named after what it proves

Each test feeds the checker small code examples: some that **must be blocked** and some that **must be
allowed**. That proves a rule catches what it should, and doesn't block normal code by mistake.

| Test file | What it proves |
|---|---|
| `websites-showcase-only.test.mjs` | Cart, checkout, booking, "Buy now", WhatsApp and payment SDKs are blocked; phone, email and Maps links pass |
| `import-boundaries.test.mjs` | Mocks, sonner/recharts/Radix and Puck are only imported where allowed |
| `no-secrets.test.mjs` | Keys, tokens and passwords in code (even in comments) are blocked; normal values pass; files outside `src/` are scanned too, git-ignored files (`.env.local`) are not |
| `no-backend-addresses.test.mjs` | The backend domain, raw IPs and backend `localhost` ports are blocked in code, comments and docs; our own app (`localhost:3000`–`3009`) passes |
| `big-reads.test.mjs` | Whole spec files and huge files can't be read in one go; partial reads, normal files and images can |
| `money-as-string.test.mjs` | `price: number` in feature types is blocked; strings and counts pass |
| `server-action-login-check.test.mjs` | Every Server Action starts with the right login check |
| `checker-basics.test.mjs` | Windows/Mac paths, only `src/` checked, bad edits blocked (exit 2), full scan works |
| `safe-pull.test.mjs` | Plain `git pull` / merge of `origin/*` is blocked; `pnpm sync-dev` passes |
| `finish-check.test.mjs` | The finish check only runs when code changed and never loops |
| `helpers.mjs` | Shared helpers (not a test) |

Run them all:

```powershell
node --test ".claude/hooks/tests/*.test.mjs"
```

When you change a rule, add one blocked and one allowed example to its test file.

## Optional: check before every git commit

Catches problems made outside Claude (by hand) before you commit. Run once in the project root (PowerShell):

```powershell
Set-Content -Path .git/hooks/pre-commit -NoNewline -Value "#!/bin/sh`nnode .claude/hooks/check-project-rules.mjs --all`n"
```

To skip it once in an emergency: `git commit --no-verify`.
