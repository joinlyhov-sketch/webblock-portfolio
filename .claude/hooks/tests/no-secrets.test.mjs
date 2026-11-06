// What this proves: real-looking API keys, tokens and passwords can't be written into the code —
// not even inside a comment — and NEXT_PUBLIC_ variables can't hold secrets. Ordinary values still pass.
// Outside src/, every text file git would commit (docs, specs, API_TRACKING.md, diaries) is scanned too,
// while git-ignored files (.env.local) are left alone.
// Rule: .claude/rules/api-backend-access-security.md · Checker: ../check-project-rules.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkSecrets } from "../check-project-rules.mjs";
import { ids, codeIds, fake, hookPath, NEEDS_TS } from "./helpers.mjs";

const FAKE_GOOGLE_KEY = fake("AIza", "SyA1b2C3d4E5f6G7h8", "I9j0kLmNoPqRsTuVw");
const FAKE_GITHUB_TOKEN = fake("gh", "p_", "abcdefghijklmnopqr", "stuvwxyz0123456789");

test("secrets in NEXT_PUBLIC_ variables and hardcoded client secrets are blocked", () => {
  assert.ok(ids("src/lib/auth/session.ts", "process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET").includes("secret/public-env"));
  assert.ok(ids("src/lib/api/client.ts", fake('const client_', 'secret = "', 'abc123', 'xyz";')).includes("secret/hardcoded"));
});

test("real-looking credentials are blocked", () => {
  const rel = "src/lib/api/client.ts";
  assert.ok(ids(rel, `const apiKey = "${FAKE_GOOGLE_KEY}";`).includes("secret/known-token"));
  assert.ok(ids(rel, fake('const api', 'Key = "', 'a8f3k29d', 'k3l2m9x0q7";')).includes("secret/assigned-credential"));
  assert.ok(ids(rel, fake('headers: { auth', 'Token: "', 'Zx9Kq2Lm', '8Np4Rt6V" }')).includes("secret/assigned-credential"));
  assert.ok(ids(rel, fake('const admin = { pass', 'word: "', 'SuperSec', 'ret123!" };')).includes("secret/assigned-credential"));
  assert.ok(ids(rel, `const t = "${FAKE_GITHUB_TOKEN}";`).includes("secret/known-token"));
});

test("a key pasted inside a comment is still caught", NEEDS_TS, () => {
  assert.ok(codeIds("src/lib/api/client.ts", `// temp key ${FAKE_GOOGLE_KEY}`).includes("secret/known-token"));
});

test("ordinary values are allowed", () => {
  const rel = "src/features/auth/components/form.tsx";
  for (const text of [
    "const apiKey = process.env.MAPS_API_KEY;",
    'const forgotPasswordPath = "/forgot-password";',
    fake('const password', 'ResetUrl = "', 'https://webblock.com/', 'reset1";'),
    '<input placeholder="Enter your password" />',
    fake('const password', 'Label = "', 'Password";'),
    fake('const token', 'Key = "', 'wb.session.', 'token";'),
  ]) assert.deepEqual(ids(rel, text), [], text);
  assert.deepEqual(ids("src/lib/api/client.ts", "process.env.NEXT_PUBLIC_API_BASE_URL"), []);
  assert.deepEqual(ids("src/mocks/session.ts", fake('pass', 'word: "', 'DemoPass', '2026!"')), []); // fake data in mocks
});

test("outside src/: a token in a doc, spec or tracking file is caught", () => {
  assert.ok(checkSecrets("API_TRACKING.md", `Notes: tested with ${FAKE_GITHUB_TOKEN}`).some((v) => v.id === "secret/known-token"));
  assert.ok(checkSecrets("specs/user-service.json", `"example": "${FAKE_GOOGLE_KEY}"`).some((v) => v.id === "secret/known-token"));
  assert.ok(checkSecrets("api-status/sokha.json", fake('{ "auth', 'Token": "', 'Zx9Kq2Lm', '8Np4Rt6V" }')).length > 0);
});

test("outside src/: docs may mention carts, WhatsApp and NEXT_PUBLIC_ names", () => {
  assert.deepEqual(checkSecrets("README.md", "No cart, checkout or WhatsApp. Never put NEXT_PUBLIC_API_SECRET in env."), []);
});

test("--all scans committable files outside src/, but not git-ignored ones", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "wb-repo-"));
  const git = (...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (git("init", "-q").status !== 0) return; // git not installed: nothing to prove here
  mkdirSync(path.join(dir, "src"));
  writeFileSync(path.join(dir, "src/ok.ts"), "export const a = 1;\n");
  writeFileSync(path.join(dir, ".gitignore"), ".env.local\n");
  writeFileSync(path.join(dir, ".env.local"), `GITHUB_TOKEN=${FAKE_GITHUB_TOKEN}\n`); // ignored: fine
  writeFileSync(path.join(dir, "NOTES.md"), "Cart, checkout and WhatsApp are not allowed.\n");
  const run = () => spawnSync(process.execPath, [hookPath("check-project-rules.mjs"), "--all"], {
    encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
  });
  assert.equal(run().status, 0);
  writeFileSync(path.join(dir, "NOTES.md"), `Tested with ${FAKE_GITHUB_TOKEN}\n`); // would be committed
  const r = run();
  assert.equal(r.status, 1);
  assert.match(r.stderr, /NOTES\.md:1/);
});
