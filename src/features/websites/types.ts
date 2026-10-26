import type { TemplateKey } from "@/features/editor";

/** Deploy states are owned by the backend; the frontend only displays them. */
export type WebsiteStatus = "DRAFT" | "DEPLOYING" | "LIVE" | "FAILED";

/** GET /websites — a website the signed-in user owns. */
export type Website = {
  id: string;
  name: string;
  templateId: string;
  templateKey: TemplateKey;
  /** e.g. "petalandstem" → petalandstem.webblock.com */
  subdomain: string;
  status: WebsiteStatus;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
