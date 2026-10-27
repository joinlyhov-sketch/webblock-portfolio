import type { ReactNode } from "react";
import Link from "next/link";
import {
  Calendar1,
  Card as CardIcon,
  Crown1,
  DocumentText,
  ExportSquare,
  Global,
  Profile,
  Profile2User,
  SearchNormal1,
  Sms,
  Timer1,
} from "iconsax-reactjs";
import { Avatar, Thumbnail } from "@/components/common/avatar";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard, KpiGrid } from "@/components/common/kpi-card";
import { Modal } from "@/components/common/modal";
import { PlanBadge, planLabel } from "@/components/common/plan-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSearch } from "@/components/common/table-search";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import type { AdminWebsite, UserAccount, UserStats } from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { DetailHero, DetailSection, HeroChip } from "./detail-hero";
import { UserRowMenu } from "./user-row-menu";

const count = new Intl.NumberFormat("en-US");

export function UsersView({
  users,
  stats,
  searchParams,
  detail,
}: {
  users: Page<UserAccount>;
  stats: UserStats;
  searchParams: SearchParams;
  /** The account opened with `?user=<id>`, with its websites. */
  detail: { user: UserAccount; websites: Page<AdminWebsite> } | null;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const detailHref = (id: string) => tableHref(searchParams, { user: id });

  return (
    <>
      <AdminPageHeader title="User Accounts" description="Search accounts and see each owner's websites." />

      <KpiGrid>
        <KpiCard label="Total accounts" value={count.format(stats.totalAccounts)} tone="brand" icon={<Profile2User />} />
        <KpiCard label="On free trial" value={count.format(stats.onFreeTrial)} tone="violet" icon={<Timer1 />} href="/admin/subscriptions?plan=FREE_TRIAL" />
        <KpiCard label="Paying" value={count.format(stats.paying)} tone="success" icon={<CardIcon />} href="/admin/subscriptions?status=ACTIVE" />
        <KpiCard label="Live websites" value={count.format(stats.liveWebsites)} tone="teal" icon={<Global />} href="/admin/websites?release=LIVE" />
      </KpiGrid>

      <DataTable
        label="User accounts"
        itemLabel="accounts"
        data={users}
        searchParams={searchParams}
        rowKey={(u) => u.id}
        toolbar={
          <>
            <TableSearch searchParams={searchParams} placeholder="Search by name or email" />
            <Button asChild size="md" className="ml-auto">
              <a href={`/admin/users/export${q ? `?q=${encodeURIComponent(q)}` : ""}`} download>
                <ExportSquare />
                Export CSV
              </a>
            </Button>
          </>
        }
        empty={
          q ? (
            <EmptyState
              icon={<SearchNormal1 />}
              title={`No accounts match “${q}”`}
              description="Check the spelling or search by email instead."
              action={
                <Button asChild variant="soft" size="sm">
                  <Link href="/admin/users">Clear search</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState icon={<Profile2User />} title="No accounts yet" description="People who sign up show here." />
          )
        }
        columns={[
          {
            key: "account",
            header: "Account",
            sortField: "fullName",
            cell: (u) => (
              <Link href={detailHref(u.id)} scroll={false} className="group flex min-w-0 items-center gap-3">
                <Avatar name={u.fullName} src={u.avatarUrl} />
                <span className="min-w-0">
                  <span className="block max-w-[260px] truncate font-semibold text-foreground group-hover:text-primary">
                    {u.fullName}
                  </span>
                  <span className="block max-w-[260px] truncate text-xs text-muted-foreground">{u.email}</span>
                </span>
              </Link>
            ),
          },
          { key: "websites", header: "Websites", sortField: "websiteCount", cell: (u) => u.websiteCount },
          { key: "plan", header: "Plan", sortField: "plan", cell: (u) => <PlanBadge plan={u.plan} /> },
          {
            key: "joined",
            header: "Joined",
            sortField: "joinedAt",
            cell: (u) => <span className="text-muted-foreground">{formatDate(u.joinedAt)}</span>,
          },
          { key: "status", header: "Status", sortField: "status", cell: (u) => <StatusBadge status={u.status} /> },
          {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            className: "w-16 text-right",
            cell: (u) => <UserRowMenu user={u} detailHref={detailHref(u.id)} />,
          },
        ]}
      />

      {detail && (
        <UserDetail
          user={detail.user}
          websites={detail.websites}
          closeHref={tableHref(searchParams, { user: null })}
        />
      )}
    </>
  );
}

function UserDetail({
  user,
  websites,
  closeHref,
}: {
  user: UserAccount;
  websites: Page<AdminWebsite>;
  closeHref: string;
}) {
  return (
    <Modal
      title={user.fullName}
      hideTitle
      closeHref={closeHref}
      footer={
        <>
          <Button asChild variant="secondary" className="flex-1">
            <Link href={`/admin/subscriptions?q=${encodeURIComponent(user.email)}`}>
              <DocumentText />
              View subscription
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/admin/websites?owner=${user.id}`}>
              <ExportSquare />
              View websites
            </Link>
          </Button>
        </>
      }
    >
      <DetailHero
        media={<Avatar name={user.fullName} src={user.avatarUrl} size="lg" className="ring-4" />}
        title={user.fullName}
        subtitle={user.email}
        chips={
          <>
            <StatusBadge status={user.status} />
            <HeroChip icon={<Sms />}>{user.signInMethod === "GOOGLE" ? "Google sign-in" : "Email sign-in"}</HeroChip>
          </>
        }
      />
      <div className="space-y-5 px-6 py-5">
        <DetailSection title="Account details" icon={<Profile />}>
          <dl className="grid gap-2.5 sm:grid-cols-3">
            <InfoTile icon={<DocumentText />} label="Account ID" value={user.id.slice(0, 8)} />
            <InfoTile icon={<Calendar1 />} label="Joined" value={formatDate(user.joinedAt)} />
            <InfoTile icon={<Crown1 />} label="Plan" value={`${planLabel(user.plan)} · monthly`} />
          </dl>
        </DetailSection>

        <DetailSection
          title="Projects & website status"
          icon={<Global />}
          aside={`${websites.totalItems} ${websites.totalItems === 1 ? "website" : "websites"}`}
        >
          {websites.items.length ? (
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {websites.items.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/admin/websites?website=${w.id}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted"
                  >
                    <Thumbnail src={w.thumbnailUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-foreground">{w.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{w.domain}</span>
                    </span>
                    {w.releaseStatus ? <StatusBadge status={w.releaseStatus} /> : <StatusBadge status="NOT_DEPLOYED" />}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
              No websites yet.
            </p>
          )}
        </DetailSection>
      </div>
    </Modal>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5">
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-[13px] font-semibold text-foreground">{value}</dd>
      </div>
    </div>
  );
}
