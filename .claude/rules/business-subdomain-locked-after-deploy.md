---
paths:
  - "src/features/websites/**"
  - "src/features/deploy/**"
---
<!-- What: subdomain format and the rule that it can't change once a site is LIVE.
     Loads: when editing website or deploy files. Related: business-websites-showcase-only.md -->

# Business rule: subdomain is locked after deploy

1. **Format:** subdomains match `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$` (RFC 1123). Sites get `<name>.webblock.com` only.
2. **Locked once deployed:** when `status === "LIVE"` the subdomain can never be edited. The UI shows it
   read-only and update calls never send it. The backend enforces this too: if it rejects a change,
   show its error message, don't work around it.
3. Checking availability and reserving a subdomain is the backend's job. The frontend only validates the
   format and shows what the API answers.
