// What this proves: money in feature types stays a decimal string ("19.00") as the API sends it —
// `price: number` is blocked — while counts like `total: number` and code outside types.ts still pass.
// Rule: .claude/rules/api-data-types.md · Checker: ../check-project-rules.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { ids, codeIds, NEEDS_TS } from "./helpers.mjs";

const RULE = "wire/money-as-string";

const BLOCKED = [
  ["src/features/products/types.ts", "export type Product = { price: number };"],
  ["src/features/billing/types.ts", "export type Plan = { monthlyPrice?: number };"],
  ["src/features/billing/types.ts", "export type Invoice = { totalAmount: number };"],
];

const ALLOWED = [
  ["src/features/products/types.ts", "export type Product = { price: string; priceKhr: string | null };"],
  ["src/features/products/types.ts", "export type ProductCounts = { total: number; totalItems: number };"],
  ["src/features/support/types.ts", "export type Stats = { feedbackCount: number; coffeeBreaks: number };"],
  ["src/features/editor/components/price-label.tsx", "const price: number = 1;"], // only types.ts is checked
];

for (const [rel, text] of BLOCKED) {
  test(`blocks: ${text}`, () => assert.ok(ids(rel, text).includes(RULE), `expected ${RULE} in ${rel}`));
}
for (const [rel, text] of ALLOWED) {
  test(`allows: ${text}`, () => assert.deepEqual(ids(rel, text), []));
}

test("a comment that mentions price: number is fine", NEEDS_TS, () => {
  assert.deepEqual(codeIds("src/features/products/types.ts", `
// Never write price: number here — the API sends "19.00".
export type Product = { price: string };`), []);
});
