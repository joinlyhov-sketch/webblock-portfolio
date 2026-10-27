import Link from "next/link";
import { Card, DocumentDownload, Filter, Receipt2, Refresh2 } from "iconsax-reactjs";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { FilterSelect } from "@/components/common/filter-select";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatDayMonthYear, formatPrice } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import type { BillingView as BillingData } from "../service";
import type { PlanCode, Subscription } from "../types";
import { BillingCard, CardHeader } from "./billing-card";
import { PillTabs } from "./pill-tabs";
import { PLAN_TONE, TONE_STYLE, type ToneStyle } from "./plan-tone";
import { PlanDetailsCard } from "./plan-details-card";
import { RowsSelect } from "./rows-select";

/** Panel colours of the "Current plan" card: Free trial is pale, paid plans are filled. */
const PLAN_PANEL: Record<PlanCode, { panel: string; text: string; sub: string }> = {
  FREE_TRIAL: {
    panel:
      "border-primary bg-linear-[158.56deg,var(--color-primary-soft)_0%,var(--color-background)_71.429%]",
    text: "text-primary",
    sub: "text-primary/85",
  },
  PLUS: {
    panel: "border-transparent bg-linear-to-br from-logo-from to-logo-to",
    text: "text-primary-foreground",
    sub: "text-primary-foreground/85",
  },
  PRO: {
    panel: "border-transparent bg-linear-to-br from-pro-from to-pro-to",
    text: "text-primary-foreground",
    sub: "text-primary-foreground/85",
  },
  ULTRA: {
    panel: "border-transparent bg-linear-to-br from-ultra-from to-ultra-to",
    text: "text-primary-foreground",
    sub: "text-primary-foreground/85",
  },
};

const PLAN_LETTER: Record<PlanCode, string> = {
  FREE_TRIAL: "text-muted-foreground border-border",
  PLUS: "text-primary border-primary",
  PRO: "text-pro-to border-pro-from",
  ULTRA: "text-ultra-to border-ultra-from",
};

/** Settings → Billing: current plan, plan actions, usage, then billing history. */
export function BillingView({ data, searchParams }: { data: BillingData; searchParams: SearchParams }) {
  const { subscription, daysLeft } = data;
  const paid = subscription.renewsAt !== null;
  const endDate = formatDayMonthYear(subscription.renewsAt ?? subscription.trialEndsAt);
  const tone = TONE_STYLE[PLAN_TONE[subscription.plan]];

  const tab = (label: string, status: string | null, active: boolean) => ({
    label,
    active,
    href: tableHref(searchParams, { status, page: null }),
  });

  return (
    <div data-fit-viewport className="flex min-h-0 flex-1 flex-col gap-[15px]">
      <div className="grid gap-[15px] xl:grid-cols-[465px_minmax(0,1fr)_minmax(0,1fr)] xl:grid-rows-[202px]">
        <CurrentPlanCard subscription={subscription} endDate={endDate} />

        <BillingCard className="justify-between">
          <div className="flex flex-col gap-3">
            <CardHeader
              tone="soft"
              icon={<Refresh2 />}
              title={paid ? "Renew plan" : "Choose a plan"}
              description={paid ? `Renews on ${endDate}` : `Trial ends on ${endDate}`}
              action={<DaysRing daysLeft={daysLeft} totalDays={data.periodDays} ring={tone.ring} />}
            />
            <p className="text-[13px] text-muted-foreground">
              {paid
                ? "Renew early to keep your websites online without a break."
                : data.websiteName
                  ? `Pick a plan to keep ${data.websiteName} online after your trial.`
                  : "Pick a plan to keep your websites online after your trial."}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-px">
              <p className="text-xs text-placeholder">{paid ? "Next charge" : "Plans from"}</p>
              <p className="text-sm font-semibold">
                {paid
                  ? `${formatPrice(subscription.monthlyPrice ?? "0", "USD")} · KHQR`
                  : `${formatPrice(subscription.startingPrice, "USD")} / month`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {paid && (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/billing/plans?from=settings">Change plan</Link>
                </Button>
              )}
              <Button asChild size="sm" className={tone.button}>
                <Link href="/billing/plans?from=settings">{paid ? "Renew now" : "Choose plan"}</Link>
              </Button>
            </div>
          </div>
        </BillingCard>

        <PlanDetailsCard subscription={subscription} daysLeft={daysLeft} />
      </div>

      <DataTable
        className="min-h-[360px] flex-1"
        label="Billing history"
        itemLabel="orders"
        itemLabelOne="order"
        data={data.orders}
        searchParams={searchParams}
        rowKey={(order) => order.id}
        defaultSort={{ field: "createdAt", direction: "desc" }}
        heading={
          <h2 className="flex items-center gap-3 text-lg font-semibold">
            <Receipt2 aria-hidden className="size-[22px] text-brand" /> Billing history
          </h2>
        }
        toolbar={
          <>
            <PillTabs
              size="sm"
              label="Filter billing history"
              tabs={[
                tab("All", null, data.status === "ALL"),
                tab("Paid", "paid", data.status === "PAID"),
                tab("Expired", "expired", data.status === "EXPIRED"),
              ]}
            />
            <div className="ml-auto flex items-center gap-2.5">
              <FilterSelect label="Plan:" param="plan" value={data.plan} options={data.planOptions} />
              <RowsSelect value={data.orders.size} />
            </div>
          </>
        }
        columns={[
          {
            key: "plan",
            header: "Plan",
            className: "px-0",
            cell: (order) => (
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-semibold",
                    PLAN_LETTER[order.plan],
                  )}
                >
                  {order.planName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{order.planName}</p>
                  <p className="truncate text-[13px] text-placeholder">
                    {order.period ? `${order.period} · ` : ""}
                    {order.websiteName}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "date",
            header: "Date",
            sortField: "createdAt",
            className: "w-[140px] px-0",
            cell: (order) => <span className="text-sm">{formatDayMonthYear(order.createdAt)}</span>,
          },
          {
            key: "amount",
            header: "Amount",
            sortField: "amount",
            className: "w-[110px] px-0",
            cell: (order) => (
              <span className={cn("text-sm", order.status === "PAID" ? "font-semibold" : "text-placeholder")}>
                {formatPrice(order.amount, order.currency)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            headerIcon: <Filter aria-hidden className="size-3.5" />,
            className: "w-[190px] px-0",
            cell: (order) => <StatusBadge status={order.status} />,
          },
          {
            key: "action",
            header: <span className="sr-only">Receipt</span>,
            className: "w-[200px] pr-4 pl-0 text-right",
            cell: (order) =>
              order.status === "PAID" ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <DocumentDownload aria-hidden className="size-3.5" /> Receipt
                </button>
              ) : (
                <span className="text-sm text-placeholder">QR code expired</span>
              ),
          },
        ]}
        empty={
          <EmptyState
            icon={<Receipt2 />}
            title="No billing history yet"
            description="You’re on the free trial, so there’s nothing to pay yet. Your plan orders and receipts will show up here after you choose a plan."
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href="/billing/plans?from=settings">View plans</Link>
              </Button>
            }
          />
        }
      />
    </div>
  );
}

function CurrentPlanCard({ subscription, endDate }: { subscription: Subscription; endDate: string }) {
  const theme = PLAN_PANEL[subscription.plan];
  const trial = subscription.plan === "FREE_TRIAL";

  return (
    <BillingCard className="items-stretch justify-center">
      <div
        className={cn(
          "relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] border-[1.5px] px-[26px] py-[22px]",
          theme.panel,
        )}
      >
        {trial ? (
          <>
            <div
              aria-hidden
              className="absolute -top-[1.5px] -left-[1.5px] h-[1000px] w-[1728px] bg-[url('/images/settings/dot-grid.svg')] bg-no-repeat"
            />
            <div
              aria-hidden
              className="absolute top-[-71.5px] left-[268.5px] size-[220px] bg-[url('/images/settings/glow-a.svg')]"
            />
            <div
              aria-hidden
              className="absolute top-[88.5px] left-[328.5px] size-[140px] bg-[url('/images/settings/glow-b.svg')]"
            />
          </>
        ) : (
          <>
            <div aria-hidden className="absolute top-[-71.5px] left-[268.5px] size-[220px] rounded-full bg-primary-foreground/10" />
            <div aria-hidden className="absolute top-[88.5px] left-[328.5px] size-[140px] rounded-full bg-primary-foreground/10" />
          </>
        )}
        <p className={cn("relative flex items-center gap-2 font-heading text-[17px] font-semibold", theme.text)}>
          <Card aria-hidden className="size-[18px]" /> Current plan
        </p>
        <div className="relative flex flex-col gap-0.5">
          <p className={cn("font-heading text-[38px] leading-[44px] font-semibold", theme.text)}>
            {subscription.planName}
          </p>
          <p className={cn("text-sm", theme.sub)}>
            {trial ? "Ends on" : "Renews on"} {endDate}
          </p>
        </div>
      </div>
    </BillingCard>
  );
}

/** Circular countdown (60px): the arc shows how much of the period is left. */
function DaysRing({ daysLeft, totalDays, ring }: { daysLeft: number; totalDays: number; ring: ToneStyle["ring"] }) {
  const radius = 27.9;
  const circumference = 2 * Math.PI * radius;
  const left = Math.min(1, Math.max(0, daysLeft / totalDays));

  return (
    <div role="img" aria-label={`${daysLeft} days left`} className="relative size-[60px] shrink-0">
      <svg viewBox="0 0 60 60" aria-hidden className="size-full -rotate-90">
        <defs>
          <linearGradient id="days-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={ring.from} />
            <stop offset="0.5" stopColor={ring.mid} />
            <stop offset="1" stopColor={ring.to} />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r={radius} fill="none" strokeWidth="4.2" stroke={ring.to} strokeOpacity="0.14" />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          strokeWidth="4.2"
          stroke="url(#days-ring)"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - left)}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-lg leading-none font-semibold">{daysLeft}</span>
        <span className="text-[9px] leading-[1.3] font-medium text-muted-foreground">days left</span>
      </span>
    </div>
  );
}
