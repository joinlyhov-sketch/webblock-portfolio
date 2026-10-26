import type { ActionResult } from "@/actions/result";
import { listNotifications, markAllNotificationsRead } from "@/features/notifications/api";
import type { AppNotification } from "@/types/notification";

export type NotificationsView = {
  items: AppNotification[];
  unreadCount: number;
};

export async function getNotificationsView(userId: string): Promise<NotificationsView> {
  const page = await listNotifications(userId);
  return { items: page.items, unreadCount: page.items.filter((n) => !n.read).length };
}

export async function markAllRead(userId: string): Promise<ActionResult> {
  await markAllNotificationsRead(userId);
  return { ok: true, data: undefined };
}
