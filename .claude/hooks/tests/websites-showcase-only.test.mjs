// What this proves: customer websites can't get shopping or payment code — cart, checkout, booking,
// "Buy now", quantity pickers, WhatsApp and payment SDKs are blocked; phone, email and Maps links pass.
// Rule: .claude/rules/business-websites-showcase-only.md · Checker: ../check-project-rules.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { ids, codeIds, NEEDS_TS } from "./helpers.mjs";

const BLOCKED = [
  ["src/features/editor/puck/blocks/hero.tsx", "<button>Buy now</button>", "zero-transaction/order-wording"],
  ["src/features/editor/puck/blocks/hero.tsx", "<button>Order now</button>", "zero-transaction/order-wording"],
  ["src/features/editor/puck/blocks/hero.tsx", "<h2>Booking</h2>", "zero-transaction/booking"],
  ["src/features/editor/puck/blocks/hero.tsx", "<a>Book now</a>", "zero-transaction/booking"],
  ["src/features/products/components/q.tsx", "<QuantitySelector />", "zero-transaction/quantity"],
  ["src/features/products/components/q.tsx", "const qty = 1;", "zero-transaction/quantity"],
  ["src/features/editor/puck/blocks/cards.tsx", "onClick={addToCart}", "zero-transaction/cart"],
  ["src/features/editor/puck/blocks/cards.tsx", "const { items } = useCart();", "zero-transaction/cart"],
  ["src/features/editor/puck/blocks/cards.tsx", "<Cart open />", "zero-transaction/cart"],
  ["src/features/editor/puck/blocks/cards.tsx", "<CheckoutButton />", "zero-transaction/checkout"],
  ["src/components/common/cta.tsx", '<a href="https://wa.me/855">x</a>', "zero-transaction/whatsapp"],
  ["src/components/common/cta.tsx", "Chat on WhatsApp", "zero-transaction/whatsapp"],
  // Billing is not exempt: it shows the KHQR from the API, it never talks to a payment provider itself.
  ["src/features/billing/api.ts", 'import Stripe from "stripe";', "zero-transaction/payment-provider"],
  ["src/features/billing/components/pay.tsx", '<a href="https://wa.me/1">help</a>', "zero-transaction/whatsapp"],
  ["src/features/billing/components/pay.tsx", "<CheckoutSummary />", "zero-transaction/checkout"],
  ["src/features/billing/api.ts", 'fetch("https://api.webill365.com/v1/qr")', "zero-transaction/payment-provider"],
];

const ALLOWED = [
  ["src/components/common/cta.tsx", '<a href="tel:+85512345678">Call us</a>'],
  ["src/components/common/cta.tsx", '<a href="mailto:hi@shop.com">Email us</a>'],
  ["src/components/common/cta.tsx", '`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a)}`'],
  ["src/components/common/cta.tsx", "<button>Contact us</button>"],
  ["src/features/billing/components/pay.tsx", "<button>Pay now</button> {order.orderId} KHQR expires in 10:00"],
  ["src/features/billing/api.ts", "export async function getOrder(orderId: string) {}"],
  ["src/app/(landing-page)/page.tsx", "<p>Check out our templates</p>"],
  ["src/components/ui/table.tsx", 'className="striped rows"'],
  ["src/components/common/social.tsx", "facebook.com/petalandstem"],
];

for (const [rel, text, id] of BLOCKED) {
  test(`blocks ${id}: ${text.slice(0, 40)}`, () => assert.ok(ids(rel, text).includes(id), `expected ${id} in ${rel}`));
}
for (const [rel, text] of ALLOWED) {
  test(`allows ${rel}: ${text.slice(0, 40)}`, () => assert.deepEqual(ids(rel, text), []));
}

test("comments that mention these words are fine, real code is still caught", NEEDS_TS, () => {
  const rel = "src/features/editor/puck/blocks/cards.tsx";
  assert.deepEqual(codeIds(rel, `
// Zero-transaction: no cart, no checkout, no WhatsApp here.
/* Product cards never show quantity or "Buy now". */
export const Cards = () => <a href="tel:+855">Call us</a>;`), []);
  assert.deepEqual(codeIds(rel, `export const A = () => <p>Don't forget: add to cart</p>;`), ["zero-transaction/cart"]);
  assert.deepEqual(codeIds(rel, `const url = "https://wa.me/855"; // contact`), ["zero-transaction/whatsapp"]);
  assert.deepEqual(codeIds(rel, `const a = 1; /* note */ export const B = () => <button>Buy now</button>;`), ["zero-transaction/order-wording"]);
});
