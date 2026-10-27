import type { ReactNode } from "react";
import { Avatar } from "@/components/common/avatar";
import { PageHeader } from "@/components/common/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { getUnreadNotificationCount, listNotifications } from "../api";
import { NotificationsBell } from "./notifications-bell";

/** Admin page title row, with the notification bell and the admin's avatar on the right (Figma "Header actions"). */
export async function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  /** Extra page actions, shown before the bell. */
  children?: ReactNode;
}) {
  const admin = await requireAdmin();
  const [notifications, unreadCount] = await Promise.all([
    listNotifications({}, { page: 0, size: 20 }),
    getUnreadNotificationCount(),
  ]);

  return (
    <PageHeader
      title={title}
      description={description}
      actions={
        <>
          {children}
          <NotificationsBell notifications={notifications.items} unreadCount={unreadCount} />
          <Avatar name={admin.fullName} src={admin.avatarUrl} className="size-10 text-xs" />
        </>
      }
    />
  );
}
