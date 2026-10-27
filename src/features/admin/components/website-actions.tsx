"use client";

import { useState } from "react";
import {
  Eye,
  Forbidden2,
  Global,
  PlayCircle,
  Profile,
  Refresh2,
  Sms,
} from "iconsax-reactjs";
import {
  ActionMenu,
  type ActionMenuItem,
} from "@/components/common/action-menu";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  redeployWebsiteAction,
  resumeWebsiteAction,
  suspendWebsiteAction,
} from "../actions";
import type { AdminWebsite } from "../types";
import { useAdminAction } from "./use-admin-action";

type WebsiteRef = Pick<
  AdminWebsite,
  | "id"
  | "name"
  | "domain"
  | "ownerEmail"
  | "siteStatus"
  | "releaseStatus"
  | "liveRelease"
  | "redeploysLeft"
>;

/** Why redeploy is unavailable, or null when it can run. The backend re-checks all of this. */
function redeployBlocked(website: WebsiteRef): string | null {
  if (website.siteStatus === "SUSPENDED") return "Resume hosting first";
  if (website.releaseStatus === "GOING_LIVE") return "Deploying…";
  if (website.redeploysLeft <= 0) return "No redeploys left";
  return null;
}

/** New key per click: a double-submit of the same click is ignored by the backend. */
const redeploy = (website: WebsiteRef) => () =>
  redeployWebsiteAction(website.id, crypto.randomUUID());

/** Row "⋯" menu on User Websites. */
export function WebsiteRowMenu({
  website,
  detailHref,
}: {
  website: WebsiteRef;
  detailHref: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, run] = useAdminAction();
  const suspended = website.siteStatus === "SUSPENDED";

  const items: ActionMenuItem[] = [
    { label: "View details", icon: <Eye />, href: detailHref },
    ...(website.liveRelease && !suspended
      ? [
          {
            label: "Open live site",
            icon: <Global />,
            externalHref: `https://${website.domain}`,
          },
        ]
      : []),
    {
      label: "Redeploy",
      icon: <Refresh2 />,
      disabled: redeployBlocked(website) !== null || pending,
      onSelect: () => run(redeploy(website), `Redeploying ${website.name}`),
    },
    {
      label: "Contact owner",
      icon: <Sms />,
      externalHref: `mailto:${website.ownerEmail}`,
    },
    suspended
      ? {
          label: "Resume hosting",
          icon: <PlayCircle />,
          onSelect: () =>
            run(
              () => resumeWebsiteAction(website.id),
              `${website.name} is back online`,
            ),
        }
      : {
          label: "Suspend website",
          icon: <Forbidden2 />,
          danger: true,
          onSelect: () => setConfirm(true),
        },
  ];

  return (
    <>
      <ActionMenu label={`Actions for ${website.name}`} items={items} />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        pending={pending}
        icon={<Forbidden2 />}
        title="Suspend this website?"
        description="It will be taken offline and visitors won't be able to see it. Its pages and content are kept, so you can resume hosting any time."
        confirmLabel="Suspend website"
        onConfirm={() =>
          run(
            () => suspendWebsiteAction(website.id),
            `${website.name} suspended`,
            () => setConfirm(false),
          )
        }
      />
    </>
  );
}

/** Footer of the website detail popup: Contact owner · Redeploy. */
export function WebsiteDetailActions({ website }: { website: WebsiteRef }) {
  const [pending, run] = useAdminAction();
  const blocked = redeployBlocked(website);

  return (
    <>
      <Button asChild variant="secondary" size="sm" className="flex-1">
        <a href={`mailto:${website.ownerEmail}`}>
          <Profile />
          Contact owner
        </a>
      </Button>
      <Button
        size="sm"
        className="flex-1"
        loading={pending}
        disabled={blocked !== null}
        onClick={() => run(redeploy(website), `Redeploying ${website.name}`)}
      >
        {!pending && <Refresh2 />}
        {blocked ?? "Redeploy website"}
      </Button>
    </>
  );
}
