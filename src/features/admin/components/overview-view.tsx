import Link from "next/link";
import { ArrowRight2, Danger, DollarCircle, Global, Notification, Profile2User, Send2 } from "iconsax-reactjs";
import { Thumbnail } from "@/components/common/avatar";
import { Card, CardHeader } from "@/components/common/card";
import { AreaTrendChart, DonutChart } from "@/components/common/charts";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard, KpiGrid } from "@/components/common/kpi-card";
import { StatusBadge } from "@/components/common/status-badge";
import type { Page } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { formatDate, formatMonth, formatPriceShort, formatRelative } from "@/lib/format";
import type { SearchParams } from "@/lib/table-query";
import type { AdminOverview, AttentionItem, AttentionKind, Deploy } from "../types";
import { AdminPageHeader } from "./admin-page-header";

const ATTENTION = {
  FAILED_DEPLOYS: { title: "Failed deploys", color: "danger", dot: "bg-danger", href: "/admin/websites?release=FAILED" },
  PLAN_EXPIRED: { title: "Plan expired · site offline", color: "danger-muted", dot: "bg-danger-muted", href: "/admin/subscriptions?status=EXPIRED" },
  PAYMENTS_PAST_DUE: { title: "Payments past due", color: "warning", dot: "bg-warning", href: "/admin/subscriptions?status=PENDING" },
  TRIALS_ENDING: { title: "Trials end in 3 days", color: "primary", dot: "bg-primary", href: "/admin/subscriptions?plan=FREE_TRIAL" },
} satisfies Record<AttentionKind, { title: string; color: string; dot: string; href: string }>;

function attentionDetail(item: AttentionItem): string {
  const more = item.count > 1 ? `  ·  +${item.count - 1} more` : "";
  const when = item.latestAt ? formatDate(item.latestAt) : "";
  switch (item.kind) {
    case "FAILED_DEPLOYS":
      return `Latest: ${item.latestName} · ${when}${more}`;
    case "PLAN_EXPIRED":
      return `${item.latestName} · ended ${when}${more}`;
    case "PAYMENTS_PAST_DUE":
      return `${item.amountAtRisk ? formatPriceShort(item.amountAtRisk, "USD") : ""} at risk · latest ${item.latestName}`;
    case "TRIALS_ENDING":
      return `${item.latestName} · ends ${when}${more}`;
  }
}

export function OverviewView({
  overview,
  deploys,
  searchParams,
}: {
  overview: AdminOverview;
  deploys: Page<Deploy>;
  searchParams: SearchParams;
}) {
  const openIssues = overview.attention.reduce((sum, a) => sum + a.count, 0);

  return (
    <>
      <AdminPageHeader title="Overview" description="How WebBlock is doing this month." />

      <KpiGrid>
        <KpiCard label="New accounts" value={overview.newAccounts} tone="brand" icon={<Profile2User />} href="/admin/users?sort=joinedAt,desc" />
        <KpiCard label="Websites published" value={overview.websitesPublished} tone="teal" icon={<Global />} href="/admin/websites?release=LIVE" />
        <KpiCard label="Monthly revenue" value={formatPriceShort(overview.monthlyRevenue, "USD")} tone="success" icon={<DollarCircle />} href="/admin/subscriptions" />
        <KpiCard label="Failed deploys" value={overview.failedDeploys} tone="danger" icon={<Danger />} href="/admin/websites?release=FAILED" />
      </KpiGrid>

      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_620px]">
        <Card className="p-[22px]">
          <CardHeader title="Revenue" aside="Last 12 months" />
          <AreaTrendChart
            label="Monthly revenue for the last 12 months"
            data={overview.revenueByMonth.map((r) => ({ label: formatMonth(r.month), value: Number(r.amount) }))}
            formatted={overview.revenueByMonth.map((r) => formatPriceShort(r.amount, "USD"))}
          />
        </Card>

        <Card className="flex flex-col gap-2.5 px-[22px] py-4">
          <CardHeader
            title="Needs attention"
            icon={<Notification />}
            aside={
              <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                {openIssues} open
              </span>
            }
          />
          <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row">
            <DonutChart
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
                return (
                  <li key={item.kind}>
                    <Link
                      href={meta.href}
                      className="flex items-center gap-3 rounded-xl border border-border py-1.5 pr-2 pl-3.5 transition-colors outline-none hover:border-primary/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", meta.dot)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-foreground">{meta.title}</span>
                        <span className="block truncate text-xs whitespace-pre text-muted-foreground">
                          {attentionDetail(item)}
                        </span>
                      </span>
                      <span className="grid h-[34px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-brand-soft font-heading text-base font-bold text-foreground">
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

      <DataTable
        label="Recent deploys"
        itemLabel="deploys"
        data={deploys}
        searchParams={searchParams}
        rowKey={(d) => d.id}
        footer={false}
        toolbar={
          <CardHeader
            title="Recent deploys"
            className="w-full"
            aside={
              <Link href="/admin/websites?sort=lastDeployAt,desc" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                View all <ArrowRight2 aria-hidden className="size-3.5" />
              </Link>
            }
          />
        }
        empty={<EmptyState icon={<Send2 />} title="No deploys yet" description="Deploys show here as soon as an owner publishes a website." />}
        columns={[
          {
            key: "website",
            header: "Website",
            cell: (d) => (
              <Link href={`/admin/websites?website=${d.websiteId}`} className="flex items-center gap-2.5 font-semibold text-foreground hover:text-primary">
                <Thumbnail src={d.websiteThumbnailUrl} size="sm" />
                <span className="truncate">{d.websiteName}</span>
              </Link>
            ),
          },
          {
            key: "owner",
            header: "Owner",
            cell: (d) => d.ownerName,
          },
          { key: "release", header: "Release", cell: (d) => <StatusBadge status={d.status} /> },
          {
            key: "when",
            header: "When",
            cell: (d) => <span className="text-muted-foreground">{formatRelative(d.startedAt)}</span>,
          },
        ]}
      />
    </>
  );
}
