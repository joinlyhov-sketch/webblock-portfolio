#!/usr/bin/env node
/**
 * What:    Stops Claude from bringing in remote code with a plain git command (git pull, or merging /
 *          rebasing origin/*). Claude must use `pnpm sync-dev [branch]` instead, which first checks for
 *          force-pushes and the malware signs from the 2026 attacks (see scripts/sync-dev.mjs).
 * Runs:    PreToolUse hook on Bash (.claude/settings.json). Exit 2 = command blocked, reason shown to Claude.
 * Allows:  pnpm sync-dev, and git commands that don't bring in remote code (status, diff, log, fetch,
 *          commit, merge --abort, …).
 * Limits:  Only sees Claude's commands. Pulls typed by hand or VS Code's Sync button are not seen.
 * Tests:   .claude/hooks/tests/safe-pull.test.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Blanks out quoted text, so `git commit -m "fix git pull docs"` isn't mistaken for a pull. */
const stripQuotes = (cmd) => cmd.replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, '""');

/** True when the shell command pulls, merges or rebases remote code with plain git. */
export function isUnsafePull(command) {
  const cmd = stripQuotes(String(command ?? ""));
  for (const part of cmd.split(/&&|\|\||;|\||\n/)) {
    const m = part.match(/\bgit(?:\s+-[cC]\s+\S+)*\s+(pull|merge|rebase)\b(.*)$/);
    if (!m) continue;
    const [, verb, rest] = m;
    if (verb === "pull") return true;
    if (/--(?:abort|continue|quit|skip)\b/.test(rest)) continue;
    // merge/rebase of a remote-tracking branch, FETCH_HEAD or the upstream brings in remote code
    if (/\b(?:origin|upstream)\/|FETCH_HEAD|@\{u(?:pstream)?\}/.test(rest)) return true;
  }
  return false;
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return 0; // never block on unreadable input
  }
  const command = input.tool_input?.command ?? "";
  if (!isUnsafePull(command)) return 0;
  process.stderr.write(
    "BLOCKED: don't pull or merge remote code with plain git in this repo.\n" +
      "Use `pnpm sync-dev` (latest dev) or `pnpm sync-dev <branch>` (a teammate's branch). It checks for\n" +
      "force-pushes and the known malware signs first, then merges.\n",
  );
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
