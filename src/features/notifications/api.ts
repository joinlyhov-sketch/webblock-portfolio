// Data access for the signed-in user's notifications. Mock now, Spring later.
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { notifications as seed } from "@/mocks/notifications";
import type { NotificationDto } from "./types";

const globalForStore = globalThis as typeof globalThis & { __wbNotificationsV2?: NotificationDto[] };
const store: NotificationDto[] = (globalForStore.__wbNotificationsV2 ??= structuredClone(seed));

export async function listNotifications(userId: string): Promise<Page<NotificationDto>> {
  await delay(150);
  void userId; // Spring filters by the signed-in user; the mock has one inbox.
  return toPage(
    [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    { page: 0, size: 50 },
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await delay(150);
  void userId;
  store.forEach((n) => {
    n.read = true;
  });
}
