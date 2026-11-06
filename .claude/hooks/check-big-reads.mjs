#!/usr/bin/env node
/**
 * What:    Saves usage limits: stops Claude from reading a whole huge text file (the API specs in specs/,
 *          pnpm-lock.yaml, big JSON/YAML…) in one go. Claude must search it (Grep) or read a small part
 *          (offset + limit) instead.
 * Runs:    PreToolUse hook on Read (.claude/settings.json). Exit 2 = read blocked, tip shown to Claude.
 * Allows:  small files, any read with a `limit`, and images/PDFs (the Read tool pages those itself).
 * Tests:   .claude/hooks/tests/big-reads.test.mjs
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Bigger than this (bytes) counts as "huge" — about 12k tokens. */
export const MAX_WHOLE_READ = 50 * 1024;
const BINARY_OK = /\.(png|jpe?g|gif|webp|svg|ico|pdf|ipynb)$/i;

/** Returns the reason to block, or null when the read is fine. */
export function bigReadProblem(toolInput, sizeOf) {
  const file = String(toolInput?.file_path ?? "");
  if (!file || BINARY_OK.test(file)) return null;
  if (Number(toolInput?.limit) > 0) return null; // already reading only part of it
  const posix = file.replace(/\\/g, "/");
  const size = sizeOf(file);
  const isSpec = /(^|\/)specs\/[^/]+\.(json|ya?ml)$/i.test(posix);
  if (!isSpec && (size === null || size <= MAX_WHOLE_READ)) return null;
  const kb = size === null ? "?" : Math.round(size / 1024);
  return (
    `Don't read all of ${path.basename(file)} (${kb} KB) — it would use a lot of the usage limit.\n` +
    (isSpec
      ? "Search the spec instead: Grep for the endpoint path (e.g. \"/projects/{projectId}/products\") with a few " +
        "lines of context, or Read with offset + limit around the match.\n"
      : "Use Grep to find what you need, or Read with offset + limit for just that part.\n")
  );
}

const sizeOnDisk = (file) => {
  try {
    return statSync(file).size;
  } catch {
    return null;
  }
};

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return 0; // never block on unreadable input
  }
  const problem = bigReadProblem(input.tool_input, sizeOnDisk);
  if (!problem) return 0;
  process.stderr.write(problem);
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
