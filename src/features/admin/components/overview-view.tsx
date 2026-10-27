import Link from "next/link";
import {
  Danger,
  DollarCircle,
  Global,
  Notification,
  Profile2User,
  Send2,
} from "iconsax-reactjs";
import { Thumbnail } from "@/components/common/avatar";
import { Card, CardHeader } from "@/components/common/card";
import { AreaTrendChart, DonutChart } from "@/components/common/charts";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard, KpiGrid } from "@/components/common/kpi-card";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Page } from "@/lib/api/types";
import {
  formatDayMonth,
  formatMonth,
  formatPriceShort,
  formatRelative,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AdminOverview,
  AttentionItem,
  AttentionKind,
  Deploy,
} from "../types";
import { AdminPageHeader } from "./admin-page-header";

// Figma "Needs attention": soft red, pink, yellow, blue — used for the donut and the row dots.
const ATTENTION = {
  FAILED_DEPLOYS: {
    title: "Failed deploys",
    color: "chart-red",
    dot: "bg-chart-red",
    href: "/admin/websites?release=FAILED",
  },
  PLAN_EXPIRED: {
    title: "Plan expired · site offline",
    color: "chart-pink",
    dot: "bg-chart-pink",
    href: "/admin/subscriptions?status=EXPIRED",
  },
  PAYMENTS_PAST_DUE: {
    title: "Payments past due",
    color: "chart-yellow",
    dot: "bg-chart-yellow",
    href: "/admin/subscriptions?status=PENDING",
  },
  TRIALS_ENDING: {
    title: "Trials end in 3 days",
    color: "chart-blue",
    dot: "bg-chart-blue",
    href: "/admin/subscriptions?plan=FREE_TRIAL",
  },
} satisfies Record<
  AttentionKind,
  { title: string; color: string; dot: string; href: string }
>;

/** The grey line under each issue, e.g. "Latest: Lantern Café · Oct 4  ·  +6 more". */
function attentionDetail(item: AttentionItem): string {
  const more = item.count > 1 ? `  ·  +${item.count - 1} more` : "";
  const when = item.latestAt ? formatDayMonth(item.latestAt) : "";
  const owner = item.latestOwnerName ? ` · ${item.latestOwnerName}` : "";
  switch (item.kind) {
    case "FAILED_DEPLOYS":
      return `Latest: ${item.latestName} · ${when}${more}`;
    case "PLAN_EXPIRED":
      return `${item.latestName}${owner} · ended ${when}`;
    case "PAYMENTS_PAST_DUE": {
      const risk = item.amountAtRisk
        ? `${formatPriceShort(item.amountAtRisk, "USD")} at risk`
        : "";
      const retry = item.retryInDays
        ? ` retries in ${item.retryInDays} day${item.retryInDays === 1 ? "" : "s"}`
        : "";
      return `${risk} · ${item.latestName}${retry}`;
    }
    case "TRIALS_ENDING":
      return `${item.latestName} · ends ${when}${more}`;
  }
}

export function OverviewView({
  overview,
  deploys,
}: {
  overview: AdminOverview;
  deploys: Page<Deploy>;
}) {
  const openIssues = overview.attention.reduce((sum, a) => sum + a.count, 0);

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="How WebBlock is doing this month."
      />

      <KpiGrid>
        <KpiCard
          label="New accounts"
          value={overview.newAccounts}
          tone="brand"
          icon={<Profile2User />}
          href="/admin/users?sort=joinedAt,desc"
        />
        <KpiCard
          label="Websites published"
          value={overview.websitesPublished}
          tone="teal"
          icon={<Global />}
          href="/admin/websites?release=LIVE"
        />
        <KpiCard
          label="Monthly revenue"
          value={formatPriceShort(overview.monthlyRevenue, "USD")}
          tone="success"
          icon={<DollarCircle />}
          href="/admin/subscriptions"
        />
        <KpiCard
          label="Failed deploys"
          value={overview.failedDeploys}
          tone="danger"
          icon={<Danger />}
          href="/admin/websites?release=FAILED"
        />
      </KpiGrid>

      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="p-[22px]">
          <CardHeader title="Revenue" aside="Last 12 months" />
          <AreaTrendChart
            highlightLast
            label="Monthly revenue for the last 12 months"
            data={overview.revenueByMonth.map((r) => ({
              label: formatMonth(r.month),
              value: Number(r.amount),
            }))}
            formatted={overview.revenueByMonth.map((r) =>
              formatPriceShort(r.amount, "USD"),
            )}
          />
        </Card>

        <Card className="flex flex-col gap-3 px-[22px] py-4">
          <CardHeader
            title="Needs attention"
            icon={<Notification />}
            aside={
              <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-semibold text-danger">
                {openIssues} open
              </span>
            }
          />
          <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row">
            <DonutChart
              size={150}
              total={openIssues}
              caption="open issues"
              segments={overview.attention.map((a) => ({
                label: ATTENTION[a.kind].title,
                value: a.count,
                color: ATTENTION[a.kind].color,
              }))}
            />
            <ul className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
              {overview.attention.map((item) => {
                const meta = ATTENTION[item.kind];
                const detail = attentionDetail(item);
                return (
                  <li key={item.kind}>
                    <Link
                      href={meta.href}
                      title={detail.trim()}
                      className="flex items-center gap-3 rounded-xl border border-border py-1.5 pr-2 pl-3.5 transition-colors outline-none hover:border-primary/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          meta.dot,
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-foreground">
                          {meta.title}
                        </span>
                        <span className="block truncate text-xs whitespace-pre text-muted-foreground">
                          {detail}
                        </span>
                      </span>
                      <span className="grid h-[34px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-brand-soft font-heading text-base font-bold text-foreground tabular-nums">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>

      <RecentDeploys deploys={deploys} />
    </>
  );
}

/** Figma "Recent deploys": card with an inset table, rounded grey header row, uppercase column names. */
function RecentDeploys({ deploys }: { deploys: Page<Deploy> }) {
  return (
    <Card className="px-6 pt-5 pb-2">
      <CardHeader
        title="Recent deploys"
        className="mb-3.5"
        aside={
          <Link
            href="/admin/websites?sort=lastDeployAt,desc"
            className="font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        }
      />
      {deploys.items.length === 0 ? (
        <EmptyState
          icon={<Send2 />}
          title="No deploys yet"
          description="Deploys show here as soon as an owner publishes a website."
        />
      ) : (
        <Table aria-label="Recent deploys" className="min-w-[640px] text-sm">
          <TableHeader className="bg-transparent">
            <TableRow className="border-0 [&>th]:bg-muted [&>th:first-child]:rounded-l-[10px] [&>th:last-child]:rounded-r-[10px]">
              {["No.", "Website", "Owner", "Release", "When"].map((h) => (
                <TableHead
                  key={h}
                  className="h-[43px] text-[11px] font-semibold tracking-[0.44px] text-placeholder uppercase"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-b">
            {deploys.items.map((d, i) => (
              <TableRow key={d.id} className="hover:bg-muted/70">
                <TableCell className="h-[53px] w-[72px] py-2">
                  {i + 1}
                </TableCell>
                <TableCell className="h-[53px] py-2">
                  <Link
                    href={`/admin/websites?website=${d.websiteId}`}
                    className="inline-flex items-center gap-2.5 font-semibold text-foreground hover:text-primary"
                  >
                    <Thumbnail src={d.websiteThumbnailUrl} size="sm" />
                    {d.websiteName}
                  </Link>
                </TableCell>
                <TableCell className="h-[53px] py-2">{d.ownerName}</TableCell>
                <TableCell className="h-[53px] py-2">
                  <StatusBadge status={d.status} />
                </TableCell>
                <TableCell className="h-[53px] py-2 text-muted-foreground">
                  {formatRelative(d.startedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
