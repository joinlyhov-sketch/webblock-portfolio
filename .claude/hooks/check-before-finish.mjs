#!/usr/bin/env node
/**
 * What:    When Claude finishes a task, runs the quick checks (project rules, typecheck, lint) — but only
 *          if code changed since the last passing check. If one fails, Claude must fix it before it
 *          can say "done".
 * Runs:    Stop hook (.claude/settings.json). Exit 0 = fine or nothing to check. Exit 2 = a check
 *          failed; the short reason goes to Claude.
 * Cost:    No tokens when it passes or nothing changed. The slow build stays in /check-project.
 * Loops:   If Claude is already finishing because of this hook (`stop_hook_active`), it never blocks again.
 * Tests:   .claude/hooks/tests/finish-check.test.mjs
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|css|json)$/;

/** Changed code files from `git status --porcelain --untracked-files=all` output. */
export function changedCodeFiles(porcelain) {
  return porcelain
    .split("\n")
    .map((line) => line.slice(3).trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
    .map((f) => (f.includes(" -> ") ? f.split(" -> ")[1] : f))
    .filter((f) => CODE.test(f) && !f.startsWith("node_modules/") && !f.startsWith(".next/"));
}

/** What to do: "skip-loop" | "skip-nothing-changed" | "skip-already-checked" | "check". */
export function decide({ stopHookActive, files, fingerprint, lastFingerprint }) {
  if (stopHookActive) return "skip-loop";
  if (files.length === 0) return "skip-nothing-changed";
  if (fingerprint && fingerprint === lastFingerprint) return "skip-already-checked";
  return "check";
}

/** Fingerprint of the current changes: file list + size/modified time, so edits change it. */
export function fingerprintOf(files, projectDir) {
  const h = createHash("sha1");
  for (const f of [...files].sort()) {
    let stamp = "deleted";
    try {
      const s = statSync(path.join(projectDir, f));
      stamp = `${s.size}:${s.mtimeMs}`;
    } catch {
      /* deleted file */
    }
    h.update(`${f}|${stamp}\n`);
  }
  return h.digest("hex");
}

const lastTail = (text, lines = 40) => text.trim().split("\n").slice(-lines).join("\n");

function main() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    /* no input: treat as a normal stop */
  }

  const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], {
    cwd: projectDir,
    encoding: "utf8",
  });
  if (status.status !== 0) return 0; // not a git repo / git missing: never block

  const files = changedCodeFiles(status.stdout);
  const stateFile = path.join(
    tmpdir(),
    `webblock-finish-check-${createHash("sha1").update(projectDir).digest("hex").slice(0, 10)}.txt`,
  );
  let lastFingerprint = "";
  try {
    lastFingerprint = readFileSync(stateFile, "utf8").trim();
  } catch {
    /* first run */
  }
  const fingerprint = files.length ? fingerprintOf(files, projectDir) : "";

  if (decide({ stopHookActive: input.stop_hook_active === true, files, fingerprint, lastFingerprint }) !== "check") {
    return 0;
  }

  const rulesScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-project-rules.mjs");
  const options = {
    cwd: projectDir,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    maxBuffer: 32 * 1024 * 1024,
  };
  // Fixed command strings only (nothing from input), run through the shell so pnpm.cmd works on Windows.
  const steps = [
    ["project rules", () => spawnSync(process.execPath, [rulesScript, "--all"], options)],
    ["typecheck", () => spawnSync("pnpm typecheck", { ...options, shell: true })],
    ["lint", () => spawnSync("pnpm lint", { ...options, shell: true })],
  ];
  for (const [name, runStep] of steps) {
    const r = runStep();
    if (r.status !== 0) {
      process.stderr.write(
        `Finish check failed at "${name}". Fix this before finishing (don't disable the rule):\n` +
          `${lastTail(`${r.stdout ?? ""}\n${r.stderr ?? ""}`)}\n`,
      );
      return 2;
    }
  }

  try {
    writeFileSync(stateFile, fingerprint);
  } catch {
    /* can't remember: it will just check again next time */
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
