// What this proves: every Server Action starts with the right login check — requireAdmin() in
// features/admin, requireWebsiteOwner(websiteId) when it acts on a website, otherwise requireUser() —
// and the checker isn't fooled by renamed, nested or late checks.
// Rule: .claude/rules/structure-server-actions.md · Checker: ../check-project-rules.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkServerActions } from "../check-project-rules.mjs";
import { ts, NEEDS_TS } from "./helpers.mjs";

const PRODUCTS = "src/features/products/actions.ts";
const ADMIN = "src/features/admin/users/actions.ts";
/** [actionName, ruleId] for every problem found. */
const problems = (text, rel = PRODUCTS) =>
  checkServerActions(ts, rel, `"use server";\n${text}`).map((v) => [v.match, v.id]);

test("correct checks are accepted", NEEDS_TS, () => {
  assert.deepEqual(problems(`
export async function updateProfile(fd: FormData) { const user = await requireUser(); return user; }
export async function createProduct(websiteId: string, _prev: unknown, fd: FormData): Promise<{ ok: boolean }> {
  await requireWebsiteOwner(websiteId); return { ok: true };
}
export const deleteProduct = async (websiteId: string, productId: string) => { await requireWebsiteOwner(websiteId); };
export async function saveInfo({ websiteId, name }: { websiteId: string; name: string }) { await requireWebsiteOwner(websiteId); }
export async function savePage(input: { websiteId: string }) { await requireWebsiteOwner(input.websiteId); }
async function renameSite(websiteId: string) { await requireWebsiteOwner(websiteId); }
export { renameSite as rename };
export type Foo = { a: string };`), []);
});

test("a missing or late check is reported", NEEDS_TS, () => {
  assert.deepEqual(problems(`
export async function noAuth() { return 1; }
export async function lateAuth(websiteId: string) { const x = websiteId.trim(); await requireWebsiteOwner(x); }
export async function notAwaited() { requireUser(); }
export const arrowExpr = async () => requireAdmin();
async function hidden() { return 2; }
export { hidden };`), [
    ["noAuth", "auth/server-action"], ["lateAuth", "auth/server-action"], ["notAwaited", "auth/server-action"],
    ["arrowExpr", "auth/server-action"], ["hidden", "auth/server-action"],
  ]);
});

test("a website action that only checks 'logged in' is reported", NEEDS_TS, () => {
  assert.deepEqual(problems(`
export async function onlyLoggedIn(websiteId: string, fd: FormData) { await requireUser(); }
export async function adminInstead(websiteId: string) { await requireAdmin(); }`), [
    ["onlyLoggedIn", "auth/website-owner"], ["adminInstead", "auth/website-owner"],
  ]);
});

test("passing the wrong id to requireWebsiteOwner is reported", NEEDS_TS, () => {
  assert.deepEqual(problems(`
export async function productIdInstead(websiteId: string, productId: string) { await requireWebsiteOwner(productId); }
export async function literalId(websiteId: string) { await requireWebsiteOwner("site-1"); }
export async function noWebsiteParam(siteId: string) { await requireWebsiteOwner(siteId); }
export async function fromOtherObject(input: { siteId: string }) { await requireWebsiteOwner(input.siteId); }`), [
    ["productIdInstead", "auth/website-owner"], ["literalId", "auth/website-owner"],
    ["noWebsiteParam", "auth/website-owner"], ["fromOtherObject", "auth/website-owner"],
  ]);
});

test("admin features must use requireAdmin", NEEDS_TS, () => {
  assert.deepEqual(problems(`
export async function suspendUser(userId: string) { const admin = await requireAdmin(); }
export async function suspendHosting(websiteId: string) { await requireAdmin(); }
export async function userCheck(userId: string) { await requireUser(); }
export async function ownerCheck(websiteId: string) { await requireWebsiteOwner(websiteId); }`, ADMIN), [
    ["userCheck", "auth/admin-action"], ["ownerCheck", "auth/admin-action"],
  ]);
});

test("files without 'use server' are ignored", NEEDS_TS, () => {
  assert.deepEqual(checkServerActions(ts, PRODUCTS, "export async function listProducts() { return []; }"), []);
});

test("a websiteId hidden in nested, aliased or named-type params is still caught", NEEDS_TS, () => {
  assert.deepEqual(problems(`
type SaveInput = { websiteId: string; name: string };
export async function nested(input: { websiteId: string }) { await requireUser(); }
export async function aliased({ websiteId: id }: { websiteId: string }) { await requireUser(); }
export async function namedType(input: SaveInput) { await requireUser(); return input.websiteId; }
export async function fromForm(_prev: unknown, fd: FormData) { await requireUser(); const w = fd.get("websiteId"); }
export async function aliasWrongVar({ websiteId: id, productId }: { websiteId: string; productId: string }) {
  await requireWebsiteOwner(productId);
}`), [
    ["nested", "auth/website-owner"], ["aliased", "auth/website-owner"], ["namedType", "auth/website-owner"],
    ["fromForm", "auth/website-owner"], ["aliasWrongVar", "auth/website-owner"],
  ]);
});

test("aliased and named-type website ids are accepted when checked", NEEDS_TS, () => {
  assert.deepEqual(problems(`
type SaveInput = { websiteId: string };
export async function aliasedOk({ websiteId: id }: { websiteId: string }) { await requireWebsiteOwner(id); }
export async function namedTypeOk(input: SaveInput) { await requireWebsiteOwner(input.websiteId); }`), []);
});
