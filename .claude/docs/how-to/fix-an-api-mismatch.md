<!-- What: what to do when a real API call fails or returns data the frontend doesn't expect.
     Related: skills/debug-issue, agents/api-contract-checker.md, skills/update-backend-spec -->

# How to fix an API mismatch

When a real call returns 4xx/5xx, or the page shows empty or wrong data:

1. **Read the error message.** `ApiError` carries the backend's `detail`. `401` = login expired
   (sign in again). `404` = endpoint missing or wrong path. `400/422` = the request body doesn't match
   what the backend expects.
2. **Compare three things** (ask the `api-contract-checker` agent): the real response, the feature's
   `types.ts`, and the endpoint in `specs/`. If the real response and the spec disagree, the spec is
   probably outdated — download the new one and run `/update-backend-spec`.
3. **Is it the backend's problem?** Money sent as a number, a missing field, or an endpoint that
   doesn't exist yet → tell the backend team (it shows as 🔴 / ❌ in `API_TRACKING.md`). Don't patch it
   in the frontend.
4. **Still unclear?** `/debug-issue <symptom>` — reproduce first, no fix without a reproduction.
