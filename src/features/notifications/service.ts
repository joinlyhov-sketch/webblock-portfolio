import type { ActionResult } from "@/lib/actions/result";
import { getBusinessInfo } from "@/features/business-info/api";
import { getTemplateSite } from "@/features/templates/api";
import { getWebsite } from "@/features/websites/api";
import { listNotifications, markAllNotificationsRead } from "./api";
import type { AppNotification } from "./types";

export type NotificationsView = {
  items: AppNotification[];
  unreadCount: number;
};

export async function getNotificationsView(userId: string): Promise<NotificationsView> {
  const page = await listNotifications(userId);
  // Each website's logo comes from its business details (else its template's mark), like the Admin lists.
  const logos = new Map<string, { logoUrl: string | null; templateSlug: string | null }>();
  for (const id of new Set(page.items.flatMap((n) => (n.websiteId ? [n.websiteId] : [])))) {
    const [info, website] = await Promise.all([
      getBusinessInfo(id).catch(() => null),
      getWebsite(id).catch(() => null),
    ]);
    const template = website ? await getTemplateSite(website.templateId).catch(() => null) : null;
    logos.set(id, { logoUrl: info?.logoUrl ?? null, templateSlug: template?.slug ?? null });
  }
  const items: AppNotification[] = page.items.map((n) => ({
    ...n,
    logoUrl: (n.websiteId && logos.get(n.websiteId)?.logoUrl) || null,
    templateSlug: (n.websiteId && logos.get(n.websiteId)?.templateSlug) || null,
  }));
  return { items, unreadCount: items.filter((n) => !n.read).length };
}

export async function markAllRead(userId: string): Promise<ActionResult> {
  await markAllNotificationsRead(userId);
  return { ok: true, data: undefined };
}
