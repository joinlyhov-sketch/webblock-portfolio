import { SearchNormal1 } from "iconsax-reactjs";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { formatRelativeTime } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import type { NotificationsView } from "@/features/notifications/service";
import type { WebsitesView as WebsitesData } from "../service";
import type { Template } from "@/features/templates/types";
import { NewWebsiteCard } from "./new-website-card";
import { NotificationBell } from "./notification-bell";
import { WebsiteCard } from "./website-card";

/** "My Websites": status tabs and search (both in the URL), the new-website tile and the cards. */
export function WebsitesView({
  data,
  notifications,
  templates,
  businessTypes,
  searchParams,
}: {
  data: WebsitesData;
  notifications: NotificationsView;
  templates: Template[];
  businessTypes: string[];
  searchParams: SearchParams;
}) {
  const filtering = data.status !== "ALL" || data.q !== "";
  const tab = (label: string, status: string | null, count: number, active: boolean) => ({
    label,
    count,
    active,
    href: tableHref(searchParams, { status, page: null }),
  });

  return (
    <>
      <div className="relative z-[5]">
        <Breadcrumb current="My Websites" />
        <div className="absolute -top-2.5 right-0">
          <NotificationBell
            items={notifications.items.map((n) => ({ ...n, timeLabel: shortTime(n.createdAt) }))}
          />
        </div>
      </div>

      <PageHeader
        className="mb-0"
        title="My Websites"
        description="Pick a website to edit it, manage it or publish changes."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          label="Filter websites by status"
          tabs={[
            tab("All", null, data.counts.ALL, data.status === "ALL"),
            tab("Live", "live", data.counts.LIVE, data.status === "LIVE"),
            tab("Draft", "draft", data.counts.DRAFT, data.status === "DRAFT"),
            tab("Suspended", "suspended", data.counts.SUSPENDED, data.status === "SUSPENDED"),
          ]}
        />
        <SearchInput defaultValue={data.q} placeholder="Search websites" label="Search websites" />
      </div>

      <div className="pt-1 pb-6">
        {filtering && data.websites.length === 0 ? (
          <EmptyState
            icon={<SearchNormal1 />}
            title="No websites found"
            description="Nothing matches this filter. Try another status or clear your search."
          />
        ) : (
          <div className="grid gap-[15px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!filtering && <NewWebsiteCard templates={templates} businessTypes={businessTypes} />}
            {data.websites.map((website) => (
              <WebsiteCard key={website.id} website={website} filtered={data.status !== "ALL"} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/** "2 minutes ago" → "2 mins ago", so it fits the narrow notification row. */
function shortTime(iso: string): string {
  const text = formatRelativeTime(iso)
    .replace("minutes", "mins")
    .replace("a minute", "1 min")
    .replace("an hour", "1 hour");
  return text === "yesterday" ? "Yesterday" : text;
}
