// What this proves: the finish check only runs when code changed since the last passing check,
// finds changed files correctly in git output, and never blocks Claude twice in a row (no loops).
// Hook: ../check-before-finish.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { changedCodeFiles, decide } from "../check-before-finish.mjs";

test("finds changed code files in git status output", () => {
  const porcelain = [
    " M src/features/products/api.ts",
    "?? src/lib/api/client.ts",
    " M .claude/rules/api-data-types.md",
    "R  old.ts -> src/new-name.ts",
    " D src/mocks/products.ts",
    "?? public/mock/x.png",
    " M package.json",
  ].join("\n");
  assert.deepEqual(changedCodeFiles(porcelain), [
    "src/features/products/api.ts",
    "src/lib/api/client.ts",
    "src/new-name.ts",
    "src/mocks/products.ts",
    "package.json",
  ]);
});

test("only checks when code changed since the last passing check, and never loops", () => {
  const files = ["src/a.ts"];
  assert.equal(decide({ stopHookActive: true, files, fingerprint: "x", lastFingerprint: "" }), "skip-loop");
  assert.equal(decide({ stopHookActive: false, files: [], fingerprint: "", lastFingerprint: "" }), "skip-nothing-changed");
  assert.equal(decide({ stopHookActive: false, files, fingerprint: "x", lastFingerprint: "x" }), "skip-already-checked");
  assert.equal(decide({ stopHookActive: false, files, fingerprint: "y", lastFingerprint: "x" }), "check");
});
