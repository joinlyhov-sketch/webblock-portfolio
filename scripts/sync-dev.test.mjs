// What:  tests for the malware scan in sync-dev.mjs (no git or network needed).
//   node --test scripts/sync-dev.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { scanChanges } from "./sync-dev.mjs";

const scan = (changes, newFiles = {}, oldFiles = {}) =>
  scanChanges(changes, (f) => newFiles[f] ?? null, (f) => oldFiles[f] ?? null);

test("flags the signs from the earlier attack", () => {
  const w = scan(
    [
      { status: "A", file: ".vscode/tasks.json" },
      { status: "A", file: "init" },
      { status: "A", file: "src/app/(billing)/billing/pay/[orderId]/public/fonts/fa-brand-400.orc" },
      { status: "M", file: "package.json" },
      { status: "M", file: ".gitignore" },
      { status: "M", file: "eslint.config.mjs" },
    ],
    {
      "package.json": JSON.stringify({ scripts: { dev: "node init && next dev" } }),
      ".gitignore": "node_modules\nconfig.bat\n",
      "eslint.config.mjs": `export default [];${" ".repeat(300)}eval(atob("x"))`,
    },
    { "package.json": JSON.stringify({ scripts: { dev: "next dev" } }), ".gitignore": "node_modules\n.env*\n" },
  );
  assert.equal(w.length, 7, w.join("\n"));
});

test("normal feature work passes", () => {
  assert.deepEqual(scan(
    [
      { status: "M", file: "src/features/products/api.ts" },
      { status: "A", file: "api-status/sokha.json" },
      { status: "M", file: "package.json" },
      { status: "D", file: "src/mocks/products.ts" },
    ],
    {
      "src/features/products/api.ts": "export async function listProducts() {\n  return apiClient('project');\n}\n",
      "package.json": JSON.stringify({ scripts: { dev: "next dev", "api:track": "node x" } }),
    },
    { "package.json": JSON.stringify({ scripts: { dev: "next dev" } }) },
  ), []);
});

test("a changed dev/build script is reported so a person checks it", () => {
  const w = scan([{ status: "M", file: "package.json" }],
    { "package.json": JSON.stringify({ scripts: { build: "node tools/x.js && next build" } }) },
    { "package.json": JSON.stringify({ scripts: { build: "next build" } }) });
  assert.match(w.join(), /"build" script changed/);
});
