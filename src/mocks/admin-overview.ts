import type { AdminOverview } from "@/features/admin/types";

export const adminOverview: AdminOverview = {
  newAccounts: 64,
  websitesPublished: 41,
  monthlyRevenue: "14920.00",
  failedDeploys: 3,
  revenueByMonth: [
    { month: "2025-11-01T00:00:00Z", amount: "8240.00" },
    { month: "2025-12-01T00:00:00Z", amount: "8910.00" },
    { month: "2026-01-01T00:00:00Z", amount: "9180.00" },
    { month: "2026-02-01T00:00:00Z", amount: "9105.00" },
    { month: "2026-03-01T00:00:00Z", amount: "10220.00" },
    { month: "2026-04-01T00:00:00Z", amount: "10640.00" },
    { month: "2026-05-01T00:00:00Z", amount: "11310.00" },
    { month: "2026-06-01T00:00:00Z", amount: "11650.00" },
    { month: "2026-07-01T00:00:00Z", amount: "12280.00" },
    { month: "2026-08-01T00:00:00Z", amount: "12890.00" },
    { month: "2026-09-01T00:00:00Z", amount: "13740.00" },
    { month: "2026-10-01T00:00:00Z", amount: "14920.00" },
  ],
  attention: [
    {
      kind: "FAILED_DEPLOYS",
      count: 7,
      latestName: "Lantern Café",
      latestAt: "2026-10-04T10:05:00Z",
      amountAtRisk: null,
    },
    {
      kind: "PLAN_EXPIRED",
      count: 1,
      latestName: "Hollow & Co.",
      latestAt: "2026-09-02T08:45:00Z",
      amountAtRisk: null,
    },
    {
      kind: "PAYMENTS_PAST_DUE",
      count: 14,
      latestName: "Corner Chair",
      latestAt: "2026-10-03T03:30:00Z",
      amountAtRisk: "266.00",
    },
    {
      kind: "TRIALS_ENDING",
      count: 38,
      latestName: "Riverfish Kitchen",
      latestAt: "2026-10-29T06:25:00Z",
      amountAtRisk: null,
    },
  ],
};
