// What this proves: the checker itself works as a hook — it reads Windows and Mac paths, only checks
// code in src/, blocks a bad edit before it happens (exit 2), and a full scan of src/ fails on a violation.
// Checker: ../check-project-rules.mjs (used by settings.json hooks and /check-project)
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { toRel } from "../check-project-rules.mjs";
import { ids, hookPath } from "./helpers.mjs";

const SCRIPT = hookPath("check-project-rules.mjs");
const run = (args, input, env = {}) =>
  spawnSync(process.execPath, [SCRIPT, ...args], { input, encoding: "utf8", env: { ...process.env, ...env } });

test("reads Windows and POSIX paths", () => {
  assert.equal(
    toRel("C:\\Users\\Zeven\\Desktop\\webblock-web\\src\\features\\x\\api.ts", "C:\\Users\\Zeven\\Desktop\\webblock-web"),
    "src/features/x/api.ts",
  );
  assert.equal(toRel("c:/users/zeven/desktop/webblock-web/src/a.ts", "C:\\Users\\Zeven\\Desktop\\webblock-web"), "src/a.ts");
  assert.equal(toRel("C:\\Users\\Zeven\\Desktop\\webblock-web\\src\\a.ts", undefined), "src/a.ts");
  assert.equal(toRel("/home/me/webblock-web/src/a.ts", "/home/me/webblock-web"), "src/a.ts");
  assert.equal(toRel("D:\\other\\README.md", "C:\\proj"), null);
});

test("files outside src/ (docs, rules) are not checked", () => {
  assert.deepEqual(ids("README.md", "add to cart, checkout, WhatsApp"), []);
  assert.deepEqual(ids(".claude/rules/business-websites-showcase-only.md", "No cart, checkout or WhatsApp"), []);
});

test("--pre blocks a bad edit (Windows path) with exit 2 and says why", () => {
  const r = run(["--pre"], JSON.stringify({
    tool_name: "Write",
    tool_input: { file_path: "C:\\Users\\Zeven\\Desktop\\webblock-web\\src\\components\\common\\cta.tsx", content: "wa.me/855" },
  }), { CLAUDE_PROJECT_DIR: "C:\\Users\\Zeven\\Desktop\\webblock-web" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /zero-transaction\/whatsapp/);
});

test("--pre checks Edit and MultiEdit new text, and allows clean edits", () => {
  const edit = (tool_input) => run(["--pre"], JSON.stringify({ tool_input }), { CLAUDE_PROJECT_DIR: "/p" }).status;
  assert.equal(edit({ file_path: "/p/src/a.tsx", old_string: "x", new_string: "checkout()" }), 2);
  assert.equal(edit({ file_path: "/p/src/a.tsx", edits: [{ new_string: "ok" }, { new_string: "Buy now" }] }), 2);
  assert.equal(edit({ file_path: "/p/src/a.tsx", old_string: "x", new_string: "Contact us" }), 0);
});

test("--all scans src/ and fails on a violation", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "wb-"));
  mkdirSync(path.join(dir, "src/features/products/components"), { recursive: true });
  writeFileSync(path.join(dir, "src/features/products/components/ok.tsx"), "export const A = () => <a href='tel:1'>Call us</a>;");
  assert.equal(run(["--all"], "", { CLAUDE_PROJECT_DIR: dir }).status, 0);
  writeFileSync(path.join(dir, "src/features/products/components/bad.tsx"), "export const B = () => <button>Buy now</button>;");
  const r = run(["--all"], "", { CLAUDE_PROJECT_DIR: dir });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /bad\.tsx:1/);
});
