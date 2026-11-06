<!-- What: why the backend's API docs are committed in specs/ and how they are used. Status: accepted.
     Related: docs/backend-services-list.md, skills/update-backend-spec, API_TRACKING.md -->

# Decision 002: backend API docs are kept in `specs/`

## Context
The backend is 6 Spring Boot microservices, each with its own address and Swagger docs. The docs sit
behind Cloudflare, so tools (and Claude) can't download them automatically, and running all services on
every frontend laptop is too heavy.

## Decision
- A copy of each service's Swagger/OpenAPI file is committed in `specs/` (downloaded by a person in the
  browser). It is a **reference**: what endpoints exist, what they take and return.
- `specs/` is not a gate. If a teammate confirms an endpoint works for real before `specs/` is updated,
  the real result counts; `API_TRACKING.md` marks it "not in spec (outdated?)".
- Frontend types are written by hand in each `features/<name>/types.ts`, following the spec and the
  real responses (no code generation step).
- Real call results are recorded automatically (development only) and `API_TRACKING.md` is rebuilt from
  `api.ts` endpoint comments + `specs/` + those results.

## Consequences
- Claude searches `specs/` by path instead of reading whole files (keeps token use low).
- When the backend changes, someone downloads the new file and runs `/update-backend-spec`.
