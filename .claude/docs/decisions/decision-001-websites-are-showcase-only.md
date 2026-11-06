<!-- What: why customer websites never sell, book or take payment. Status: accepted.
     Enforced by: rules/business-websites-showcase-only.md + hooks/check-project-rules.mjs -->

# Decision 001: customer websites are showcase-only

## Context
Small businesses on WebBlock need an online presence, not an online shop. Taking orders or payments
on their sites would bring payment-card compliance (PCI-DSS), refunds, fraud and much more backend work.

## Decision
Customer websites never take transactions: no cart, checkout, booking, payment or WhatsApp.
Every call-to-action goes to phone (`tel:`), email (`mailto:`), Google Maps directions, or an external
`https://` link. The only payments in WebBlock are the platform's own subscriptions (KHQR via WeBill365),
handled by the backend; the frontend only shows the QR and status.

## Consequences
- The checker blocks cart/checkout/booking/WhatsApp code on every edit.
- Product blocks are display-only: name, price, image, category.
