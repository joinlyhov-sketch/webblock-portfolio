import Image from "next/image";
import Link from "next/link";
import { Add, Edit2, ExportSquare, Eye, Global } from "iconsax-reactjs";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, type StatusMeta } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import type { Website, WebsiteStatus } from "../types";

const WEBSITE_STATUS = {
  DRAFT: { label: "Draft", tone: "neutral" },
  DEPLOYING: { label: "Deploying", tone: "brand" },
  LIVE: { label: "Live", tone: "success" },
  FAILED: { label: "Deploy failed", tone: "danger" },
} satisfies Record<WebsiteStatus, StatusMeta>;

/** The user's websites with Edit / Preview / View live. */
export function WebsitesView({ data }: { data: Page<Website> }) {
  return (
    <>
      <PageHeader
        title="My websites"
        description="Edit your pages, preview them on any device and deploy when you're ready."
        actions={
          <Button asChild>
            <Link href="/templates">
              <Add /> New website
            </Link>
          </Button>
        }
      />

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border px-6 py-24 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Global aria-hidden className="size-[22px]" />
          </span>
          <h2 className="text-[17px] font-semibold text-foreground">No websites yet</h2>
          <p className="max-w-md text-[13px] text-muted-foreground">Pick a template to start your first website.</p>
          <Button asChild variant="soft" size="sm">
            <Link href="/templates">Browse templates</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-[15px] md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((website) => (
            <li key={website.id} className="flex flex-col gap-4 rounded-[20px] border border-border bg-background p-3 shadow-card">
              <div className="relative h-44 overflow-hidden rounded-[14px] bg-primary-soft">
                {website.thumbnailUrl && (
                  <Image src={website.thumbnailUrl} alt="" fill sizes="(min-width: 1280px) 33vw, 100vw" className="object-cover object-top" />
                )}
                <StatusBadge {...WEBSITE_STATUS[website.status]} className="absolute top-2.5 right-3 shadow-button" />
              </div>
              <div className="flex flex-col gap-1 px-1.5">
                <h2 className="text-[17px] font-semibold text-foreground">{website.name}</h2>
                <p className="text-[13px] text-muted-foreground">
                  {website.subdomain}.webblock.com · edited {formatDate(website.updatedAt)}
                </p>
              </div>
              <div className="flex gap-2 px-1.5 pb-1.5">
                <Button asChild variant="soft" size="sm" className="flex-1">
                  <Link href={`/websites/${website.id}/edit`}>
                    <Edit2 /> Edit
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="flex-1">
                  <Link href={`/websites/${website.id}/preview`}>
                    <Eye /> Preview
                  </Link>
                </Button>
                {website.status === "LIVE" && (
                  <Button asChild variant="ghost" size="icon-sm" aria-label={`Open the live ${website.name} site`}>
                    <Link href={`/sites/${website.id}`} target="_blank">
                      <ExportSquare />
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
