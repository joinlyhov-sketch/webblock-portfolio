---
paths:
  - "src/features/**/actions.ts"
  - "src/features/**/api.ts"
  - "src/lib/api/**"
---
<!-- What: how backend errors (RFC 7807 Problem Details) become messages users can read.
     Loads: when editing actions.ts, api.ts or lib/api. Related: structure-server-actions.md -->

# API: error messages

Spring Boot sends errors as Problem Details:
`{ type?, title, status, detail?, instance?, errors?: Record<string, string[]> }`.

- `api.ts` only ever throws `ApiError` (`src/lib/api/errors.ts`). A raw `Response` or a JSON parse
  error never reaches a component.
- In `actions.ts`, catch `ApiError` and return `{ ok: false, message: e.message }`. `message` is
  `detail`, falling back to `title` (`detail` can be missing). Unknown errors throw to `error.tsx`.
- Validation failures (400/422) carry an `errors` map → return it as `fieldErrors`, so the form
  highlights the right inputs. (`ApiError` gets the `errors` field when the first endpoint needs it.)
- A `401` means the login expired → the user goes back to sign-in; it is not shown as an error.
- Never retry in the frontend, and never show stack traces or raw backend text other than `detail`.
