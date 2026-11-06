@AGENTS.md

# WebBlock Web (platform frontend)

Next.js App Router + TypeScript + Tailwind. Backend: 6 Spring Boot microservices. Features are moving from
mock data to the real API, one `features/<name>/api.ts` at a time (the only swap point).
Map of the whole Claude setup: `.claude/README.md`.

## Commands
- `pnpm dev` · `pnpm typecheck` · `pnpm lint` · `pnpm build`
- Package manager is **pnpm** only (pinned in `package.json`; commit `pnpm-lock.yaml`). Never npm or yarn.
  Dependency build scripts must be approved (`pnpm approve-builds`).
- `pnpm sync-dev [branch]` — the ONLY way to bring in remote code (checks for force-pushes and malware
  first). Never a plain `git pull` / merge of `origin/*`.
- After each change: `/check-project quick`. Before saying a task is done, committing or pushing:
  `/check-project` (includes the build). The quick checks also run automatically when Claude finishes a task.

## Where things go
`src/app` routes only (thin pages) · `src/features/<name>` business code · `src/components/ui` shadcn
primitives · `src/components/common` design system · `src/components/layout` shells · `src/lib` API client,
errors, auth, format, table-query · `src/mocks` fake data (only `features/*/api.ts` may import it) ·
`src/config` nav/constants · `src/hooks` shared client hooks.
Feature folder shape and the reference feature (`src/features/websites`): `.claude/rules/structure-feature-folders.md`.
Import direction (never reverse): `app → features → components/common → components/ui → packages`.
Never import `sonner`, `recharts`, `@radix-ui/*` or Puck directly: use the wrappers in `components/`.

## Invariants (enforced by `.claude/hooks/check-project-rules.mjs`)
1. ZERO-TRANSACTION websites: no cart, checkout, payment form, booking or WhatsApp. CTAs only `tel:`,
   `mailto:`, Google Maps, external `https://`. Platform billing (KHQR via WeBill365) only in
   `features/billing`, and it only DISPLAYS what the API returns; the backend talks to WeBill.
2. Backend owns logic: retries, deploy state, OTP, SSL, payment. Frontend triggers and displays.
3. Every Server Action starts with `requireAdmin()` (features/admin), `requireWebsiteOwner(websiteId)`
   (acts on a website) or `requireUser()`.
4. API DTO shape everywhere: camelCase, UUID string ids, money as decimal strings, ISO-8601 UTC dates.

## Conventions
- Server Components by default; `"use client"` only on interactive leaves.
- Reads in Server Components via `api.ts`; writes via Server Actions. Filters/tabs/pagination in URL `searchParams`.
- Every list screen has loading, empty and error states. Format at render with `lib/format.ts`.
- Named exports, kebab-case files, no `any`. Reuse `components/common` before creating anything.
- Design: Familjen Grotesk / DM Sans, accent `#4379D6`, tokens in `globals.css` (never hardcode hex),
  shadcn/ui only, icons `iconsax-reactjs` only. Details: `.claude/rules/ui-components-and-design.md`.

## Workflow
- Fetch/connect anything to the backend → follow `/connect-feature-to-api`.
- New feature `/new-feature` · Figma → code `/figma-to-screen` · bugs `/debug-issue` (reproduce first).
- Before handing in: `/prepare-pull-request` (runs `/check-project` + the reviewer agents).
- No GitHub Actions / CI: every check runs locally (hooks + `/check-project`).
- Branches (case-sensitive): `Master` submission only (only the designated teammate merges `dev` into it;
  never commit to it) · `dev` integration, only the
  repo manager commits directly (`WEBBLOCK_ROLE=manager` in their `.claude/settings.local.json`) ·
  `feature/<name>` from the latest `dev`; API work uses `feature/<feature>-api`.
- Never edit `.claude/hooks/` to make a check pass; if a rule looks wrong, stop and ask.
- No Claude attribution in commits or PRs (no `Co-Authored-By`, no "Generated with", no session link).
