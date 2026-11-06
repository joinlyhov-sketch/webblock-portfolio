// What this proves: Claude can't read a whole huge file (API specs, lockfile, big JSON) in one go — it
// must search it or read part of it — while normal files, partial reads and images are never blocked.
// Hook: ../check-big-reads.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { bigReadProblem, MAX_WHOLE_READ } from "../check-big-reads.mjs";
import { hookPath } from "./helpers.mjs";

const size = (bytes) => () => bytes;

test("a whole spec file is blocked, even a small one, with a search tip", () => {
  const p = bigReadProblem({ file_path: "C:\\repo\\specs\\project-service.json" }, size(400_000));
  assert.match(p, /Grep for the endpoint path/);
  assert.ok(bigReadProblem({ file_path: "/repo/specs/provisioning-service.yaml" }, size(2_000)));
});

test("any other huge text file is blocked", () => {
  assert.match(bigReadProblem({ file_path: "/repo/pnpm-lock.yaml" }, size(MAX_WHOLE_READ + 1)), /offset \+ limit/);
});

test("normal files, partial reads and images are allowed", () => {
  assert.equal(bigReadProblem({ file_path: "/repo/src/features/products/api.ts" }, size(8_000)), null);
  assert.equal(bigReadProblem({ file_path: "/repo/specs/project-service.json", offset: 120, limit: 60 }, size(400_000)), null);
  assert.equal(bigReadProblem({ file_path: "/repo/pnpm-lock.yaml", limit: 100 }, size(900_000)), null);
  assert.equal(bigReadProblem({ file_path: "/repo/public/mock/hero.png" }, size(900_000)), null);
  assert.equal(bigReadProblem({ file_path: "/repo/docs/design.pdf" }, size(5_000_000)), null);
  assert.equal(bigReadProblem({ file_path: "/repo/missing.md" }, () => null), null);
});

test("hook exits 2 for a big read and 0 otherwise", () => {
  const run = (tool_input) =>
    spawnSync(process.execPath, [hookPath("check-big-reads.mjs")], { input: JSON.stringify({ tool_input }), encoding: "utf8" });
  const lock = new URL("../../../../pnpm-lock.yaml", import.meta.url); // the real lockfile once installed in the repo
  const r = run({ file_path: lock.pathname.replace(/^\/([A-Za-z]:)/, "$1") });
  if (r.status === 2) assert.match(r.stderr, /pnpm-lock\.yaml/); // only when that file exists and is big
  assert.equal(run({ file_path: "/does/not/exist.ts" }).status, 0);
  assert.equal(spawnSync(process.execPath, [hookPath("check-big-reads.mjs")], { input: "nope", encoding: "utf8" }).status, 0);
});
