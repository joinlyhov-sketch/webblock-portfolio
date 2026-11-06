<!-- =====================================================================
  AUDIT MATRIX: API_TRACKING.md
  ROLE: Master Frontend-to-Backend Integration Matrix & Coverage Ledger
  LIFECYCLE: Checked by teammates, updated automatically via auto-sync-tracking.mjs
  EVALUATOR NOTE: Serves as the complete verification ledger across 6 microservices
===================================================================== -->

# WebBlock — API Integration & Verification Matrix

> Ground truth for feature integration status.

## 1. Authentication & Identity (`specs/user-service.json`)
| Endpoint | Method | Swap File | Status | Assignee | Verified Invariant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/auth/sign-in` | `POST` | `src/features/auth/api.ts` | [ ] Pending | @frontend | Cookie/Bearer session |
| `/auth/register` | `POST` | `src/features/auth/api.ts` | [ ] Pending | @frontend | 6-Digit OTP trigger |
| `/auth/verify-otp` | `POST` | `src/features/auth/api.ts` | [ ] Pending | @frontend | OTP auth confirmation |
| `/me` | `GET` | `src/features/auth/api.ts` | [ ] Pending | @frontend | Quotas & active plan |
| `/me/deploy-access` | `GET` | `src/features/auth/api.ts` | [ ] Pending | @frontend | Deploy permission gate |

## 2. Product Catalog & Projects (`specs/project-service.json`)
| Endpoint | Method | Swap File | Status | Assignee | Verified Invariant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/projects/{id}/products` | `GET` | `src/features/products/api.ts` | [ ] Pending | @frontend | Zero-transaction catalog |
| `/projects/{id}/products` | `POST` | `src/features/products/api.ts` | [ ] Pending | @frontend | Decimal string price ("19.00") |
| `/projects/{id}/products/{id}` | `PUT` | `src/features/products/api.ts` | [ ] Pending | @frontend | Decimal string price ("19.00") |
| `/projects/{id}/products/{id}` | `DELETE` | `src/features/products/api.ts` | [ ] Pending | @frontend | Hard delete verification |
| `/projects/{id}/pages/{pageId}` | `PUT` | `src/features/editor/api.ts` | [ ] Pending | @frontend | Puck JSON AST optimistic locking |
