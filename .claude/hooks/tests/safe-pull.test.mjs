// What this proves: Claude can't bring in remote code with a plain `git pull` / merge of origin/* —
// it must use `pnpm sync-dev`, which checks for force-pushes and malware first. Other git commands pass.
// Hook: ../check-safe-pull.mjs · Script: scripts/sync-dev.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isUnsafePull } from "../check-safe-pull.mjs";

const BLOCKED = [
  "git pull",
  "git pull origin dev",
  "git pull --rebase origin feature/products-api",
  "git -C /repo pull",
  "git fetch origin dev && git merge origin/dev",
  "git merge --no-edit origin/feature/x",
  "git rebase origin/dev",
  "git merge FETCH_HEAD",
  "git merge @{u}",
  "cd repo; git pull",
];
const ALLOWED = [
  "pnpm sync-dev",
  "pnpm sync-dev feature/products-api",
  "git status",
  "git diff --stat HEAD...origin/dev",
  "git log origin/dev -5",
  "git fetch origin dev",
  'git commit -m "explain why we never git pull origin dev"',
  "git merge --abort",
  "git rebase --continue",
  "git merge feature/local-branch",
  "git checkout -b feature/products-api",
];

for (const cmd of BLOCKED) test(`blocks: ${cmd}`, () => assert.equal(isUnsafePull(cmd), true));
for (const cmd of ALLOWED) test(`allows: ${cmd}`, () => assert.equal(isUnsafePull(cmd), false));

const SCRIPT = fileURLToPath(new URL("../check-safe-pull.mjs", import.meta.url));
const run = (command) =>
  spawnSync(process.execPath, [SCRIPT], { input: JSON.stringify({ tool_input: { command } }), encoding: "utf8" });

test("hook exits 2 with a reason for a pull, 0 otherwise", () => {
  const r = run("git pull origin dev");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /pnpm sync-dev/);
  assert.equal(run("git status").status, 0);
  assert.equal(spawnSync(process.execPath, [SCRIPT], { input: "not json", encoding: "utf8" }).status, 0);
});
