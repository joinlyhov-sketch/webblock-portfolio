export type NotificationKind = "SUCCESS" | "WARNING" | "INFO";

/** What the API returns. `websiteId` is the website it is about, `null` for platform messages. */
export type NotificationDto = {
  id: string;
  /** Who it is about: a website name or "WebBlock Billing". */
  title: string;
  message: string;
  kind: NotificationKind;
  websiteId: string | null;
  createdAt: string;
  read: boolean;
};

/** A notification as the screen shows it, with the website's logo: the uploaded one, else its template's mark. */
export type AppNotification = NotificationDto & {
  logoUrl: string | null;
  templateSlug: string | null;
};
