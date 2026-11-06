# `.claude/` — how Claude is set up for WebBlock

This folder tells Claude Code how to work on this repo: which rules to follow, which checks run
automatically, and which step-by-step commands (skills) the team can use. Claude doesn't load this
README automatically, so it costs no tokens — it's the map for teammates and evaluators.

## How it fits together

| Layer | Files | When it takes effect |
|---|---|---|
| Always loaded | `CLAUDE.md`, `AGENTS.md` (repo root) | Every Claude session |
| Rules | `rules/*.md` | Only when Claude opens a file matching the rule's `paths:` |
| Automatic checks | `hooks/*.mjs`, wired in `settings.json` | Before/after every edit, before a pull, at the end of every task |
| Skills (slash commands) | `skills/<name>/SKILL.md` | When you type `/<name>` or ask for that kind of task |
| Reviewers | `agents/*.md` | When Claude (or you) asks one to review; they only read |
| Background docs | `docs/**` | Only when someone opens them |

Every file starts with a short `What / Loads / Related` comment.

## Rules (`rules/`)

| File | What it says | Loads when editing |
|---|---|---|
| `business-websites-showcase-only.md` | No cart, checkout, booking, payment or WhatsApp on customer sites; allowed CTAs | editor, templates, products, business-info, components |
| `business-subdomain-locked-after-deploy.md` | Subdomain format; can't change once LIVE | websites, deploy |
| `structure-feature-folders.md` | Shape of every `features/<name>/` folder | features, mocks |
| `structure-pages-and-routes.md` | Thin Server Component pages, URL state, route groups | `src/app`, `src/proxy.ts` |
| `structure-server-actions.md` | Login check first → validate → api.ts → revalidate → `ActionResult` | `actions.ts` |
| `ui-components-and-design.md` | Which shared component to use, design tokens, icons | components, `globals.css` |
| `api-data-types.md` | UUID ids, money as decimal strings, ISO dates, enums | `types.ts`, `api.ts`, `lib/api` |
| `api-error-messages.md` | Backend errors → readable messages and form field errors | `actions.ts`, `api.ts`, `lib/api` |
| `api-pagination.md` | 1-based URL/UI vs 0-based API pages | `api.ts`, `table-query.ts` |
| `api-backend-access-security.md` | Server-only backend URLs and login tokens, `apiClient` | `api.ts`, `lib/api`, `lib/auth`, `next.config.ts` |
| `editor-website-blocks.md` | The 7 editor blocks, plain-JSON props, save conflicts | `src/features/editor` |

## Automatic checks (`hooks/`)

| File | Runs | Does |
|---|---|---|
| `check-project-rules.mjs` | Before and after every Claude edit; in `/check-project` | Blocks cart/checkout/WhatsApp code, wrong imports, secrets, hardcoded backend addresses, money typed as number, Server Actions without a login check. Its full scan also checks every other committable file (docs, specs, `API_TRACKING.md`) for secrets |
| `check-before-finish.mjs` | When Claude finishes a task | If code changed: project rules + typecheck + lint; Claude must fix failures before saying "done" |
| `check-safe-pull.mjs` | Before Claude runs a shell command | Blocks a plain `git pull` / merge of remote code; Claude must use `pnpm sync-dev` |
| `check-big-reads.mjs` | Before Claude reads a file | Blocks reading a whole spec file or any text file over 50 KB; Claude must search it instead (saves usage limits) |
| `tests/*.test.mjs` | `node --test ".claude/hooks/tests/*.test.mjs"` | One test file per rule, named after what it proves (e.g. `money-as-string.test.mjs`) — see `hooks/README.md` |

## Skills (`skills/`)

| Command | Use it to |
|---|---|
| `/connect-feature-to-api <feature>` | Move a feature from mock data to the real backend (also triggered by "fetch … from the API") |
| `/update-api-tracking` | Rebuild `API_TRACKING.md` from the code, `specs/` and real call results |
| `/update-backend-spec <service> <file>` | Replace a spec in `specs/` with a newer download and show what changed |
| `/check-project [quick \| <branch>]` | Run every check; on a teammate's branch, malware check first |
| `/prepare-pull-request` | Self-check and summary before saying "ready, branch X" |
| `/debug-issue <problem>` | Reproduce → find the cause → smallest fix |
| `/fast-data-fetching` | Vercel's rules for loading data fast (no waterfalls, parallel calls, Suspense) — 13 rules picked from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (MIT), each in its own file |
| `/new-feature <name>` | Create a new feature folder like `features/websites` |
| `/figma-to-screen <url>` | Build a screen from a Figma frame |

## Reviewers (`agents/`, read-only)

| Agent | Reviews |
|---|---|
| `code-reviewer` | Structure, boundaries, design system, loading/empty/error states |
| `business-rules-checker` | Zero-transaction, login checks, backend jobs, secrets, billing scope |
| `api-contract-checker` | `types.ts` / `api.ts` vs the backend spec and real responses |
| `editor-blocks-checker` | Editor block list, plain-JSON props, CTAs, save conflicts |

## Docs (`docs/`)

| File | About |
|---|---|
| `backend-services-list.md` | The 6 services, what each covers and their spec file names |
| `WebBlock-Claude-Setup-Guide.pdf` | 27-page guide for teammates and mentors. Part 1: Claude Code basics (how it works, permissions, building blocks, models and limits, good habits, commands). Part 2: the WebBlock setup, backend access via the API gateway, the workflow, tracking, safety, token saving, roadmap and FAQ |
| `decisions/decision-001-websites-are-showcase-only.md` | Why sites never take payments |
| `decisions/decision-002-api-docs-kept-in-specs.md` | Why API docs live in `specs/` and how they're used |
| `decisions/decision-003-editor-save-conflicts.md` | Why editor saves never overwrite |
| `how-to/connect-a-feature-to-the-api.md` | The teammate workflow, step by step |
| `how-to/fix-an-api-mismatch.md` | What to do when a real call fails or returns odd data |
| `how-to/add-an-editor-block.md` | Adding or changing an editor block |

## Outside tools (official sources only, exact versions)

| Tool | From | Shared? | What it gives Claude |
|---|---|---|---|
| `next-devtools` MCP | Vercel (`next-devtools-mcp` 0.4.0, dev dependency, runs from `node_modules` via `/.mcp.json`) | Yes — Claude asks each person to approve it once | Live errors, routes and logs from the running `pnpm dev`, plus Next.js docs |
| `typescript-lsp` plugin | Anthropic (`claude-plugins-official`) | No — each person installs it | Go-to-definition, find-references and live type errors while editing |
| `fast-data-fetching` skill | Vercel Engineering (copied, reviewed) | Yes, in `skills/` | See the Skills table |

Picked for safety: official publishers, pinned versions (no `@latest`), nothing with install scripts.
Third-party skills, hooks or MCP servers from community directories are not used.

## Files that can't hold comments

- **`settings.json` team defaults (to save usage limits):** model `sonnet`, effort `high`, and the
  design plugins `intent`, `figma`, `impeccable` turned off in this project (their skill lists cost ~8k
  tokens per message). These are defaults, not locks: `/model opus` for one session, or put your own
  `"model"` / `"enabledPlugins": { "figma@synced": true }` in your git-ignored `.claude/settings.local.json`.
  claude.ai connectors (Canva, Notion, Drive…) belong to each person's account: turn the unused ones off
  with `/mcp` in this project.
- **`settings.json`** — shared Claude settings: which commands run without asking (`allow`), which
  need approval (`ask`), which are blocked (`deny`: `.env*` files, `git push`, `rm -rf`, editing
  `hooks/`), the hooks above, and no Claude attribution in commits.
- **`package.json` scripts** — `pnpm dev / build / lint / typecheck` as usual, plus `pnpm sync-dev [branch]`
  (safe way to bring in remote code, see `scripts/sync-dev.mjs`).
- **`/.mcp.json`** (repo root) — the shared MCP servers: only `next-devtools`, run with plain `node`
  from `node_modules` so it works the same on Windows and Mac and stays pinned by `pnpm-lock.yaml`.

## Personal setup (not shared)

- **Repo manager:** create `.claude/settings.local.json` (git-ignored) with
  `{ "env": { "WEBBLOCK_ROLE": "manager" } }` so Claude stays on `dev` instead of creating feature branches.
- Getting the latest `dev`: always `pnpm sync-dev`, never VS Code's Sync button or a plain `git pull`.
- **TypeScript code intelligence (optional, recommended):**
  1. `pnpm setup`, then restart the terminal (puts pnpm's global folder on your PATH)
  2. `pnpm add -g typescript-language-server@6.0.2`
  3. `claude plugin install typescript-lsp@claude-plugins-official`, then restart Claude Code
- **next-devtools:** nothing to install (`pnpm install` brings it). When Claude asks to use the
  `next-devtools` MCP server from `.mcp.json`, approve it. It only works while `pnpm dev` is running.
