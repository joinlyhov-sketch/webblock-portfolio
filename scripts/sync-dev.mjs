#!/usr/bin/env node
/**
 * What:    Safely brings remote code into your current branch. Use it instead of `git pull`.
 *            pnpm sync-dev                       → latest dev
 *            pnpm sync-dev feature/products-api  → a teammate's branch
 * Checks:  1. The branch was not force-pushed (history rewritten) — how both 2026 attacks were done.
 *          2. A read-only scan of the incoming changes finds none of the known malware signs.
 *          Nothing from the incoming code is executed. Only if both checks pass does it merge.
 * Runs:    By hand, or by Claude (hooks/check-safe-pull.mjs makes Claude use it). Costs 0 tokens.
 * Exit:    0 = merged or already up to date · 1 = stopped (uncommitted changes, warning, or git error).
 * Limits:  If something (e.g. VS Code auto-fetch) already fetched a force-pushed branch, check 1 can't
 *          see it; the malware scan (check 2) still runs.
 * Tests:   node --test scripts/sync-dev.test.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CODE_FILE = /\.(m?js|cjs|ts|tsx|jsx)$/;
const RUN_SCRIPTS = ["dev", "build", "start", "preinstall", "install", "postinstall", "prepare"];

/**
 * Looks for the known malware signs in the incoming changes.
 * @param changes  [{ status: "A"|"M"|"D", file }]
 * @param readNew  (file) => content in the incoming commit, or null
 * @param readOld  (file) => content in your current branch, or null
 * @returns list of human-readable warnings (empty = clean)
 */
export function scanChanges(changes, readNew, readOld) {
  const warnings = [];
  for (const { status, file } of changes) {
    if (status === "D") continue;
    const base = path.posix.basename(file);
    if (file === ".vscode/tasks.json") warnings.push(`${file}: VS Code task file (the attack hid an auto-run task here)`);
    if (file === ".vscode/settings.json" && /allowAutomaticTasks/.test(readNew(file) ?? "")) {
      warnings.push(`${file}: turns on automatic VS Code tasks`);
    }
    if (/^init(\.[a-z]+)?$/i.test(file)) warnings.push(`${file}: unexpected "init" file in the repo root`);
    if (/^config\.bat$/i.test(base)) warnings.push(`${file}: unexpected config.bat`);
    if (/\.orc$/i.test(file) || /^src\/app\/.*\/public\/fonts\//.test(file)) {
      warnings.push(`${file}: fake font file inside src/app (the attack hid its payload like this)`);
    }
    if (file === "package.json") {
      const scripts = (text) => { try { return JSON.parse(text ?? "{}").scripts ?? {}; } catch { return {}; } };
      const next = scripts(readNew(file));
      const prev = scripts(readOld(file));
      for (const name of RUN_SCRIPTS) {
        if (/\bnode\s+init\b/.test(next[name] ?? "")) warnings.push(`package.json: "${name}" runs "node init"`);
        else if ((next[name] ?? "") !== (prev[name] ?? "")) {
          warnings.push(`package.json: the "${name}" script changed — check it before running anything`);
        }
      }
    }
    if (file === ".gitignore") {
      const next = readNew(file) ?? "";
      const prev = readOld(file) ?? "";
      if (/^\.env/m.test(prev) && !/^\.env/m.test(next)) warnings.push(".gitignore: stops ignoring .env files");
      if (/config\.bat/.test(next) && !/config\.bat/.test(prev)) warnings.push(".gitignore: hides config.bat");
    }
    if (CODE_FILE.test(file)) {
      const text = readNew(file) ?? "";
      for (const line of text.split("\n")) {
        if (/[ \t]{150,}\S/.test(line)) { warnings.push(`${file}: code hidden after a long run of spaces`); break; }
        if (line.length > 5000) { warnings.push(`${file}: extremely long line (possibly obfuscated)`); break; }
      }
    }
  }
  return warnings;
}

function git(args) {
  const r = spawnSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

function main(argv) {
  const branch = argv[2] || "dev";
  if (!/^[A-Za-z0-9._/-]+$/.test(branch)) return stop(`"${branch}" is not a valid branch name.`);

  if (git(["status", "--porcelain"]).out) {
    return stop("You have uncommitted changes. Commit or stash them first, then run this again.");
  }

  const ref = `origin/${branch}`;
  const before = git(["rev-parse", "--verify", "--quiet", ref]).out || null;
  console.log(`Fetching ${ref} …`);
  const fetched = git(["fetch", "origin", branch]);
  if (!fetched.ok) return stop(`git fetch failed:\n${fetched.err}`);
  const after = git(["rev-parse", ref]).out;

  const warnings = [];
  if (before && before !== after && !git(["merge-base", "--is-ancestor", before, after]).ok) {
    warnings.push(`${ref} was FORCE-PUSHED (its history was rewritten since your last fetch)`);
  }

  const mergeBase = git(["merge-base", "HEAD", after]);
  if (!mergeBase.ok) warnings.push(`${ref} shares no history with your branch`);
  else if (mergeBase.out === after) {
    if (!warnings.length) { console.log(`Already up to date with ${ref}.`); return 0; }
  } else {
    const changes = git(["diff", "--name-status", "--no-renames", mergeBase.out, after]).out
      .split("\n").filter(Boolean).map((l) => { const [status, file] = l.split("\t"); return { status: status[0], file }; });
    const show = (rev) => (file) => { const r = git(["show", `${rev}:${file}`]); return r.ok ? r.out : null; };
    warnings.push(...scanChanges(changes, show(after), show("HEAD")));
    console.log(`Checked ${changes.length} incoming file(s).`);
  }

  if (warnings.length) {
    console.error(`\n🚨 STOPPED — nothing was merged.\n${warnings.map((w) => `  • ${w}`).join("\n")}\n` +
      "Don't run or open anything from this branch. Tell the repo manager.");
    return 1;
  }

  const merged = spawnSync("git", ["merge", "--no-edit", ref], { stdio: "inherit" });
  if (merged.status !== 0) return stop("The merge stopped (probably conflicts). Resolve them, then commit.");
  console.log(`✓ Merged ${ref}.`);
  return 0;
}

function stop(message) {
  console.error(message);
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv);
}
