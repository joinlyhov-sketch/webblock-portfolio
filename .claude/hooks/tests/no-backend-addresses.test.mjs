// What this proves: no backend address is written into the repo — not the team's backend domain, not a
// raw IP, not localhost on a backend port — in code, comments or docs. Our own app (localhost:3000-3009) is fine.
// Addresses belong in .env.local and reach the code only through apiClient.
// Rule: .claude/rules/api-backend-access-security.md · Checker: ../check-project-rules.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSecrets } from "../check-project-rules.mjs";
import { ids, codeIds, NEEDS_TS } from "./helpers.mjs";

const RULE = "secret/backend-address";
// Built from parts so this test file itself never contains a full address.
const TEAM_DOMAIN = ["docs-project", "roa-dev", "digital"].join(".");

test("backend addresses in code are blocked", () => {
  const rel = "src/lib/api/client.ts";
  assert.ok(ids(rel, `const BASE = "https://${TEAM_DOMAIN}/v3/api-docs";`).includes(RULE));
  assert.ok(ids(rel, 'const BASE = "http://localhost:' + '8080/api";').includes(RULE));
  assert.ok(ids(rel, 'fetch("http://10.0.0.' + '12:8081/users")').includes(RULE));
});

test("a backend address in a comment is still caught", NEEDS_TS, () => {
  assert.ok(codeIds("src/features/products/api.ts", `// real endpoint: https://${TEAM_DOMAIN}/projects`).includes(RULE));
});

test("outside src/: a backend address in docs or notes is caught", () => {
  assert.ok(checkSecrets("API_TRACKING.md", `Swagger: https://${TEAM_DOMAIN}/swagger-ui/index.html`).some((v) => v.id === RULE));
});

test("our own app address (3000-3009) and env-based URLs are allowed", () => {
  assert.deepEqual(ids("src/app/api/mock-auth/route.ts", '?? "localhost:' + '3000"'), []);
  assert.deepEqual(ids("src/lib/api/client.ts", "const base = process.env.PROJECT_SERVICE_URL;"), []);
  assert.deepEqual(checkSecrets("README.md", "Open http://localhost:" + "3000 in your browser."), []);
  assert.deepEqual(checkSecrets("tests/report.md", "dev server on localhost:" + "3001"), []);
  assert.ok(checkSecrets("NOTES.md", "backend on localhost:" + "8080").length > 0);
});
