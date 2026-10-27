import type { ReactNode } from "react";
import Link from "next/link";
import { Add, Calendar1, Clock, Danger, Global, Routing2, SearchNormal1 } from "iconsax-reactjs";
import { Avatar, Thumbnail } from "@/components/common/avatar";
import { Callout } from "@/components/common/callout";
import { DetailList } from "@/components/common/card";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Modal } from "@/components/common/modal";
import { planLabel } from "@/components/common/plan-badge";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSearch } from "@/components/common/table-search";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import { formatDate, formatDuration, formatRelative } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import type { AdminWebsite, Deploy, SiteStatus } from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { DetailHero, DetailSection, HeroChip } from "./detail-hero";
import { WebsiteDetailActions, WebsiteRowMenu } from "./website-actions";

const OFFLINE_REASON = {
  ONLINE: { reason: "None", hint: "site is reachable" },
  NOT_DEPLOYED: { reason: "Not deployed", hint: "no release yet" },
  OFFLINE_BILLING: { reason: "Plan expired", hint: "renew to go back online" },
  SUSPENDED: { reason: "Suspended", hint: "by an admin" },
} satisfies Record<SiteStatus, { reason: string; hint: string }>;

export function WebsitesView({
  websites,
  searchParams,
  detail,
}: {
  websites: Page<AdminWebsite>;
  searchParams: SearchParams;
  /** The website opened with `?website=<id>`, with its recent deploys. */
  detail: { website: AdminWebsite; deploys: Page<Deploy> } | null;
}) {
  const release = typeof searchParams.release === "string" ? searchParams.release : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const owner = typeof searchParams.owner === "string" ? searchParams.owner : "";
  const detailHref = (id: string) => tableHref(searchParams, { website: id });
  const filtered = Boolean(q || release || owner);

  return (
    <>
      <AdminPageHeader
        title="User Websites"
        description="Search websites, check deploy results and redeploy when needed."
      />

      <DataTable
        label="User websites"
        itemLabel="websites"
        data={websites}
        searchParams={searchParams}
        rowKey={(w) => w.id}
        toolbar={
          <>
            <TableSearch searchParams={searchParams} placeholder="Search by owner or domain" />
            {owner && websites.items[0] && (
              <Link
                href={tableHref(searchParams, { owner: null, page: null })}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-xs font-medium text-brand-strong hover:bg-brand/20"
              >
                Owner: {websites.items[0].ownerName}
                <Add aria-label="Remove owner filter" className="size-4 rotate-45" />
              </Link>
            )}
            <SegmentedTabs
              className="mb-0 ml-auto"
              tabs={[
                { label: "All", href: tableHref(searchParams, { release: null, page: null }), active: !release },
                { label: "Live", href: tableHref(searchParams, { release: "LIVE", page: null }), active: release === "LIVE" },
                { label: "Failed", href: tableHref(searchParams, { release: "FAILED", page: null }), active: release === "FAILED" },
              ]}
            />
          </>
        }
        empty={
          filtered ? (
            <EmptyState
              icon={<SearchNormal1 />}
              title="No websites match these filters"
              action={
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/websites">Show all websites</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState icon={<Global />} title="No websites yet" description="Websites show here once owners create them." />
          )
        }
        columns={[
          {
            key: "website",
            header: "Website",
            sortField: "name",
            cell: (w) => (
              <Link href={detailHref(w.id)} scroll={false} className="group flex min-w-0 items-center gap-3">
                <Thumbnail src={w.thumbnailUrl} />
                <span className="min-w-0">
                  <span className="block max-w-[260px] truncate font-semibold text-foreground group-hover:text-primary">
                    {w.name}
                  </span>
                  <span className="block max-w-[260px] truncate text-xs text-muted-foreground">{w.domain}</span>
                </span>
              </Link>
            ),
          },
          { key: "owner", header: "Owner", sortField: "ownerName", cell: (w) => w.ownerName },
          { key: "site", header: "Site", sortField: "siteStatus", cell: (w) => <StatusBadge status={w.siteStatus} /> },
          {
            key: "release",
            header: "Latest release",
            sortField: "releaseStatus",
            cell: (w) =>
              w.releaseStatus ? <StatusBadge status={w.releaseStatus} /> : <span className="text-placeholder">—</span>,
          },
          {
            key: "lastDeploy",
            header: "Last deploy",
            sortField: "lastDeployAt",
            cell: (w) => (
              <span className="text-muted-foreground">{w.lastDeployAt ? formatRelative(w.lastDeployAt) : "Never"}</span>
            ),
          },
          {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            className: "w-16 text-right",
            cell: (w) => <WebsiteRowMenu website={w} detailHref={detailHref(w.id)} />,
          },
        ]}
      />

      {detail && (
        <WebsiteDetail
          website={detail.website}
          deploys={detail.deploys}
          closeHref={tableHref(searchParams, { website: null })}
        />
      )}
    </>
  );
}

function WebsiteDetail({
  website,
  deploys,
  closeHref,
}: {
  website: AdminWebsite;
  deploys: Page<Deploy>;
  closeHref: string;
}) {
  const latest = deploys.items[0];
  const offline = OFFLINE_REASON[website.siteStatus];

  return (
    <Modal
      title={website.name}
      hideTitle
      size="lg"
      closeHref={closeHref}
      footer={<WebsiteDetailActions website={website} />}
    >
      <DetailHero
        media={<Thumbnail src={website.thumbnailUrl} size="lg" className="shadow-card" />}
        badge={website.releaseStatus ? <StatusBadge status={website.releaseStatus} /> : <StatusBadge status="NOT_DEPLOYED" />}
        title={website.name}
        link={website.liveRelease ? { href: `https://${website.domain}`, label: website.domain } : undefined}
        chips={
          <>
            <HeroChip icon={<Avatar name={website.ownerName} src={website.ownerAvatarUrl} size="sm" className="size-5 text-[8px] ring-0" />}>
              {website.ownerName}
            </HeroChip>
            {latest && (
              <HeroChip icon={<Calendar1 />}>
                Deploy #{latest.number} · {formatRelative(latest.startedAt)}
              </HeroChip>
            )}
          </>
        }
      />

      <div className="space-y-5 px-6 py-5">
        {latest?.status === "GOING_LIVE" && (
          <Callout
            icon={<Clock />}
            title={`Deploy #${latest.number} in progress`}
            description={`Step ${latest.currentStep} of ${latest.totalSteps} · ${latest.stepLabel}`}
          />
        )}
        {latest?.status === "FAILED" && (
          <Callout
            tone="danger"
            icon={<Danger />}
            title={`Deploy #${latest.number} failed`}
            description={`Stopped at step ${latest.currentStep} of ${latest.totalSteps} · ${latest.stepLabel}`}
          />
        )}

        <DetailSection title="Recent deploys">
          {deploys.items.length ? (
            <ul className="divide-y divide-border rounded-2xl border border-border text-[13px]">
              {deploys.items.map((d) => (
                <li key={d.id} className="grid grid-cols-[44px_1fr_auto_64px] items-center gap-3 px-3.5 py-2.5">
                  <span className="font-semibold text-brand">#{d.number}</span>
                  <span className="text-muted-foreground">{formatRelative(d.startedAt)}</span>
                  <StatusBadge status={d.status} />
                  <span className="text-right text-muted-foreground tabular-nums">
                    {d.durationSeconds === null ? "—" : formatDuration(d.durationSeconds)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-[13px] text-muted-foreground">
              Never deployed.
            </p>
          )}
        </DetailSection>

        <DetailSection title="Site details">
          <DetailList
            items={[
              {
                label: "SSL certificate",
                value: website.sslValidUntil ? (
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden className="size-2 rounded-full bg-success" />
                    Valid · until {formatDate(website.sslValidUntil)}
                  </span>
                ) : (
                  "Not issued yet"
                ),
              },
              {
                label: "Plan",
                value: `${planLabel(website.plan)} · until ${formatDate(website.planEndsAt)}`,
              },
              { label: "Products", value: `${website.productCount} of ${website.productLimit.toLocaleString("en-US")}` },
              { label: "Redeploys left", value: website.redeploysLeft },
            ]}
          />
        </DetailSection>

        <DetailSection title="Hosting & routing" icon={<Routing2 />}>
          <dl className="grid grid-cols-2 divide-border rounded-2xl border border-border sm:grid-cols-4 sm:divide-x">
            <HostingTile label="Hosting" value={<StatusBadge status={website.siteStatus} />} />
            <HostingTile
              label="Routing"
              value={<StatusBadge status={website.routingStatus} />}
              hint={website.routingStatus === "UPDATING" ? "route is changing" : "serving visitors"}
            />
            <HostingTile label="Live release" value={website.liveRelease ?? "—"} />
            <HostingTile label="Offline reason" value={offline.reason} hint={offline.hint} />
          </dl>
        </DetailSection>
      </div>
    </Modal>
  );
}

function HostingTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1 px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-[13px] font-semibold text-foreground">{value}</dd>
      {hint && <dd className="text-[11px] text-placeholder">{hint}</dd>}
    </div>
  );
}
