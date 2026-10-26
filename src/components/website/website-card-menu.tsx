"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Edit,
  ExportSquare,
  Global,
  More,
  PauseCircle,
  PlayCircle,
} from "iconsax-reactjs";
import { reactivateWebsiteAction, suspendWebsiteAction } from "@/actions/website-actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Popover } from "@/components/common/popover";
import { toast } from "@/components/common/toast";
import { cn } from "@/lib/utils";
import type { WebsiteStatus } from "@/types/website";

const itemClasses =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-left text-sm leading-5 font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-4 [&_svg]:shrink-0";

function MenuLink({
  href,
  onClick,
  external,
  children,
}: {
  href: string;
  onClick: () => void;
  external?: boolean;
  children: ReactNode;
}) {
  const className = cn(itemClasses, "text-foreground hover:bg-primary-soft");
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={onClick} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} role="menuitem" onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

/** "…" menu on a website card. Items depend on the status: portal always, suspend or reactivate below the line. */
export function WebsiteCardMenu({
  websiteId,
  websiteName,
  status,
  domain,
}: {
  websiteId: string;
  websiteName: string;
  status: WebsiteStatus;
  domain: string | null;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function suspend() {
    startTransition(async () => {
      const result = await suspendWebsiteAction(websiteId);
      setConfirmOpen(false);
      if (result.ok) toast.success(result.message ?? "Website suspended");
      else toast.error("Could not suspend the website", result.message);
    });
  }

  function reactivate() {
    startTransition(async () => {
      const result = await reactivateWebsiteAction(websiteId);
      if (result.ok) toast.success(result.message ?? "Website reactivated");
      else toast.error("Could not reactivate the website", result.message);
    });
  }

  return (
    <>
      <Popover
        label={`More actions for ${websiteName}`}
        trigger={<More aria-hidden className="size-[17px]" />}
        triggerClassName="size-9 rounded-[10px] text-foreground-soft transition-colors hover:bg-primary-soft"
        panelClassName="w-[216px] rounded-[14px] p-1.5 shadow-menu"
      >
        {(close) => (
          <div role="menu" className="flex flex-col gap-0.5">
            {status !== "LIVE" && (
              <MenuLink href={`/websites/${websiteId}/edit`} onClick={close}>
                <Edit aria-hidden /> <span className="flex-1">Open editor</span>
              </MenuLink>
            )}
            {status === "SUSPENDED" && domain && (
              <MenuLink href={`https://${domain}`} onClick={close} external>
                <Global aria-hidden /> <span className="flex-1">View live site</span>
                <ArrowRight aria-hidden className="-rotate-45 text-foreground-soft" />
              </MenuLink>
            )}
            <MenuLink href={`/portal/${websiteId}`} onClick={close}>
              <ExportSquare aria-hidden /> <span className="flex-1">Portal</span>
            </MenuLink>
            {status !== "DRAFT" && (
              <>
                <div className="px-1 py-[3px]">
                  <div className="h-px bg-border" />
                </div>
                {status === "LIVE" ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close();
                      setConfirmOpen(true);
                    }}
                    className={cn(itemClasses, "text-danger hover:bg-danger-soft")}
                  >
                    <PauseCircle aria-hidden /> <span className="flex-1">Suspend website</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={() => {
                      close();
                      reactivate();
                    }}
                    className={cn(itemClasses, "text-foreground hover:bg-primary-soft")}
                  >
                    <PlayCircle aria-hidden /> <span className="flex-1">Reactivate website</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </Popover>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={suspend}
        loading={pending}
        icon={<PauseCircle />}
        title="Suspend this website?"
        description="It will be taken offline and visitors won’t be able to see it. Your pages and content are kept, so you can reactivate it any time."
        confirmLabel="Suspend website"
      />
    </>
  );
}
