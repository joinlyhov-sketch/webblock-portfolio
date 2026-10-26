import Image from "next/image";
import Link from "next/link";
import { Edit2, Global } from "iconsax-reactjs";
import { CategoryBadge } from "@/components/common/category-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Website } from "../types";
import { ReactivateButton } from "./reactivate-button";
import { WebsiteCardMenu } from "./website-card-menu";

const HOUR = 3_600_000;

/** "Edited 2 hours ago", "Suspended today", "Reactivated just now". */
function activityText(website: Website): string {
  const now = Date.now();
  if (website.status === "SUSPENDED" && website.suspendedAt) {
    return now - new Date(website.suspendedAt).getTime() < 24 * HOUR
      ? "Suspended today"
      : `Suspended ${formatRelativeTime(website.suspendedAt)}`;
  }
  if (website.reactivatedAt && now - new Date(website.reactivatedAt).getTime() < HOUR) {
    const ago = formatRelativeTime(website.reactivatedAt);
    return `Reactivated ${ago === "a minute ago" ? "just now" : ago}`;
  }
  return `Edited ${formatRelativeTime(website.updatedAt)}`;
}

/**
 * One website: screenshot with status, name, address, last change and the main actions.
 * `filtered` is the status-tab view, which drops the category pill (Figma filter screens).
 */
export function WebsiteCard({ website, filtered = false }: { website: Website; filtered?: boolean }) {
  const suspended = website.status === "SUSPENDED";
  const hasMenu = website.domain !== null && (filtered || !suspended);
  // Suspended in "All": Reactivate is the main action. In the Suspended tab it is the neutral one.
  const reactivateFirst = suspended && !filtered;

  return (
    <article className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-background p-3 shadow-card">
      <div className="relative h-[200px] overflow-hidden rounded-[14px] bg-primary-soft">
        <div
          className={cn(
            "absolute inset-0 overflow-hidden bg-background shadow-card",
            !suspended && "border border-border",
          )}
        >
          <Image
            src={website.thumbnailUrl}
            alt={`${website.name} preview`}
            fill
            unoptimized
            sizes="(min-width: 1440px) 25vw, 100vw"
            className="object-cover object-top"
          />
        </div>
        <StatusBadge status={website.status} className="absolute top-3 right-[11px]" />
      </div>

      <div className="flex flex-col gap-2.5 px-1.5 pb-1.5">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] leading-[22.1px] font-semibold tracking-[-0.17px] text-foreground">
              {website.name}
            </h3>
            <p className="flex h-[19.5px] items-center gap-1.5 text-[13px] text-muted-foreground">
              <Global aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{website.domain ?? "Not published yet"}</span>
            </p>
          </div>
          {hasMenu && (
            <WebsiteCardMenu
              websiteId={website.id}
              websiteName={website.name}
              status={website.status}
              domain={website.domain}
            />
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs leading-[18px] text-muted-foreground">
              {activityText(website)} · {website.businessType}
            </span>
            {!filtered && <CategoryBadge category={website.category} className="shrink-0 shadow-none" />}
          </div>

          <div className="flex items-center gap-1.5">
            {suspended ? (
              <>
                <ReactivateButton websiteId={website.id} variant={reactivateFirst ? "primary" : "secondary"} />
                <EditButton websiteId={website.id} primary={!reactivateFirst} />
              </>
            ) : (
              <>
                {website.status === "LIVE" && website.domain ? (
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <a href={`https://${website.domain}`} target="_blank" rel="noopener noreferrer">
                      Visit site
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link href={`/websites/${website.id}/preview`}>Preview</Link>
                  </Button>
                )}
                <EditButton websiteId={website.id} primary />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EditButton({ websiteId, primary }: { websiteId: string; primary: boolean }) {
  return (
    <Button
      asChild
      size="sm"
      variant={primary ? "primary" : "secondary"}
      className={cn("flex-1", primary && "bg-primary hover:bg-brand")}
    >
      <Link href={`/websites/${websiteId}/edit`}>
        <Edit2 aria-hidden /> Edit
      </Link>
    </Button>
  );
}
