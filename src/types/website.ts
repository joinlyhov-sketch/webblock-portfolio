import type { TemplateCategory } from "./template";

export type WebsiteStatus = "LIVE" | "DRAFT" | "SUSPENDED";

export type Website = {
  id: string;
  name: string;
  businessType: string;
  category: TemplateCategory;
  status: WebsiteStatus;
  /** Public host, e.g. "petalandstem.webblock.com". `null` until the first deploy. */
  domain: string | null;
  templateId: string;
  thumbnailUrl: string;
  updatedAt: string;
  suspendedAt: string | null;
  /** Set when a suspended website was switched back on; `null` otherwise. */
  reactivatedAt: string | null;
};

export type WebsiteStatusCounts = Record<"ALL" | WebsiteStatus, number>;
