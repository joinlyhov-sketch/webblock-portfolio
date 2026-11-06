// What:  shared helpers for the hook tests (not a test file itself).
import { fileURLToPath } from "node:url";
import { checkText, loadTypeScript } from "../check-project-rules.mjs";

/** The project's TypeScript package (needed for comment and Server Action checks). */
export const ts = loadTypeScript(process.env.CLAUDE_PROJECT_DIR || process.cwd());
/** Use as a test option: skips the test when TypeScript isn't installed. */
export const NEEDS_TS = { skip: !ts && "typescript not installed" };

/** Rule ids found in `text` for the file `rel` (comments NOT ignored). */
export const ids = (rel, text) => checkText(rel, text).map((v) => v.id);
/** Rule ids found in `text` for the file `rel`, ignoring comments (like the real hooks do). */
export const codeIds = (rel, text) => checkText(rel, text, ts).map((v) => v.id);

/**
 * Fake credentials are assembled at runtime from fragments, so no complete token ever appears in a
 * test file (keeps secret scanners from flagging the tests). Never write a full fake key as one string.
 */
export const fake = (...parts) => parts.join("");

/** Absolute path of a hook script in the parent folder. */
export const hookPath = (name) => fileURLToPath(new URL(`../${name}`, import.meta.url));
