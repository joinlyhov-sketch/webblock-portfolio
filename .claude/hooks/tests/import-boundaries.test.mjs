// What this proves: code is only imported where it's allowed — mock data only in features/*/api.ts,
// sonner / recharts / Radix only inside src/components (through our wrappers), Puck only in features/editor.
// Rule: .claude/rules/structure-feature-folders.md · Checker: ../check-project-rules.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { ids, codeIds, NEEDS_TS } from "./helpers.mjs";

const BLOCKED = [
  ["src/features/products/components/grid.tsx", 'import { mockProducts } from "@/mocks/products";', "boundary/mocks"],
  ["src/features/products/components/grid.tsx", 'import { mockProducts } from "../../../mocks/products";', "boundary/mocks"],
  ["src/app/admin/page.tsx", 'import { mockUsers } from "@/mocks/users";', "boundary/mocks"],
  ["src/features/products/components/form.tsx", 'import { toast } from "sonner";', "boundary/wrapped-library"],
  ["src/features/site-monitor/components/c.tsx", 'const C = dynamic(() => import("recharts"));', "boundary/wrapped-library"],
  ["src/features/admin/users/components/m.tsx", 'import * as Dialog from "@radix-ui/react-dialog";', "boundary/wrapped-library"],
  ["src/components/common/editor.tsx", 'import { Puck } from "@measured/puck";', "boundary/puck"],
];

const ALLOWED = [
  ["src/features/products/api.ts", 'import { mockProducts } from "@/mocks/products";'],
  ["src/features/admin/users/api.ts", 'import { mockUsers } from "@/mocks/users";'],
  ["src/lib/auth/session.ts", 'import { mockUsers } from "@/mocks/session";'],
  ["src/mocks/products.ts", 'import type { Product } from "@/features/products/types";'],
  ["src/components/common/toast.tsx", 'import { Toaster, toast } from "sonner";'],
  ["src/components/common/charts/donut.tsx", 'import { PieChart } from "recharts";'],
  ["src/components/ui/dialog.tsx", 'import * as Dialog from "@radix-ui/react-dialog";'],
  ["src/features/editor/components/shell.tsx", 'import { Puck } from "@measured/puck";'],
];

for (const [rel, text, id] of BLOCKED) {
  test(`blocks ${id}: ${text.slice(0, 40)}`, () => assert.ok(ids(rel, text).includes(id), `expected ${id} in ${rel}`));
}
for (const [rel, text] of ALLOWED) {
  test(`allows ${rel}: ${text.slice(0, 40)}`, () => assert.deepEqual(ids(rel, text), []));
}

test("a commented-out import is fine", NEEDS_TS, () => {
  assert.deepEqual(codeIds("src/features/products/components/form.tsx", '// import { toast } from "sonner";'), []);
});
