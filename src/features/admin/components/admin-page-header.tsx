"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/common/page-header";
import { useAdminClientData } from "./admin-client-context";
import { AdminProfileMenu } from "./admin-profile-menu";
import { NotificationsBell } from "./notifications-bell";

/** Admin page title row, with the notification bell and the admin profile on the right (Figma "Header actions"). */
export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  /** Extra page actions, shown before the bell. */
  children?: ReactNode;
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      // Phones: the bell and profile stay beside the title instead of dropping onto their own row.
      className="max-sm:flex-nowrap max-sm:items-start"
      actions={
        <>
          {children}
          <HeaderActions />
        </>
      }
    />
  );
}

function HeaderActions() {
  const { notifications, profile } = useAdminClientData();

  return <><NotificationsBell notifications={notifications} /><AdminProfileMenu profile={profile} /></>;
}
