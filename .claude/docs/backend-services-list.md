<!-- What: the 6 backend services, what each covers, and which spec file in specs/ belongs to each.
     Related: decisions/decision-002-api-docs-kept-in-specs.md, skills/update-backend-spec, API_TRACKING.md -->

# Backend services

All 6 services sit behind **one API gateway**: a single address (`BACKEND_API_URL` in `.env.local`) that
forwards each request to the right service by its path. Only the Next.js server talks to it — the
backend has no CORS. `apiClient("<service>")` adds the service's path prefix (confirmed from the specs).

**Gateway address and Swagger links: ask the repo manager** — they're kept in the team chat, not in the
repo, so the repo doesn't map out the backend. The docs are behind Cloudflare: open them in the browser,
download the spec file by hand, then run `/update-backend-spec`.

| Service | Covers (roughly) | `apiClient("…")` | Spec file in `specs/` |
|---|---|---|---|
| User | sign-in, register, OTP, profile, plan limits | `user` | `user-service.json` |
| Project | websites, products, business info, editor pages | `project` | `project-service.json` |
| Provisioning | builds, subdomains, deploys | `provisioning` | `provisioning-service.yaml` |
| AI Codegen | AI site generation | `ai-codegen` | `ai-codegen-service.json` |
| Payment | subscriptions, KHQR via WeBill365 | `payment` | `payment-service.json` |
| Notification | notifications | `notification` | `notification-service.json` |

## Keeping `specs/` safe
- Spec files never contain the real server address: their `"servers"` entry is replaced with
  `[{ "url": "/" }]` when they are added (`/update-backend-spec` does this).
- The endpoint list itself stays — that's what `specs/` is for. That's only fine while the repo is
  **private**; if it ever becomes public, take `specs/` out of git first.
- The gateway address lives only in each person's `.env.local` (never committed); `.env.example` is the template.
