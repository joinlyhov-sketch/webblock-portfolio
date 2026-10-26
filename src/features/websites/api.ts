// Data access for websites. Mock now, Spring later: only these function bodies change.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { businessTypes, websites as seed } from "@/mocks/websites";
import { websiteOwners } from "@/mocks/session";
import type { BusinessDetails } from "./types";
import type { Website, WebsiteStatus, WebsiteStatusCounts } from "./types";

const globalForStore = globalThis as typeof globalThis & { __wbWebsites?: Website[] };
const store: Website[] = (globalForStore.__wbWebsites ??= structuredClone(seed));

function ownedBy(ownerId: string): Website[] {
  const ids = new Set(
    websiteOwners.filter((o) => o.ownerId === ownerId).map((o) => o.websiteId),
  );
  return store.filter((w) => ids.has(w.id));
}

export type ListWebsitesFilter = {
  status?: WebsiteStatus;
  q?: string;
};

export async function listWebsites(
  ownerId: string,
  filter: ListWebsitesFilter = {},
): Promise<Page<Website>> {
  await delay();
  const q = filter.q?.trim().toLowerCase();
  const items = ownedBy(ownerId)
    .filter((w) => !filter.status || w.status === filter.status)
    .filter(
      (w) =>
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.businessType.toLowerCase().includes(q) ||
        (w.domain ?? "").includes(q),
    );
  return toPage(items, { page: 0, size: 100 });
}

export async function countWebsites(ownerId: string): Promise<WebsiteStatusCounts> {
  await delay(100);
  const mine = ownedBy(ownerId);
  const count = (status: WebsiteStatus) => mine.filter((w) => w.status === status).length;
  return {
    ALL: mine.length,
    LIVE: count("LIVE"),
    DRAFT: count("DRAFT"),
    SUSPENDED: count("SUSPENDED"),
  };
}

export async function getWebsite(websiteId: string): Promise<Website> {
  await delay(100);
  const website = store.find((w) => w.id === websiteId);
  if (!website) {
    throw new ApiError({ title: "Website not found", status: 404, detail: "That website no longer exists." });
  }
  return website;
}

export type CreateWebsiteBody = {
  templateId: string;
  name: string;
  businessType: string;
  category: Website["category"];
  thumbnailUrl: string;
  details: BusinessDetails;
};

export async function createWebsite(ownerId: string, body: CreateWebsiteBody): Promise<Website> {
  await delay(400);
  if (ownedBy(ownerId).some((w) => w.name.toLowerCase() === body.name.toLowerCase())) {
    throw new ApiError({
      title: "Name already used",
      status: 409,
      detail: "You already have a website with this name. Pick a different business name.",
    });
  }
  const website: Website = {
    id: crypto.randomUUID(),
    name: body.name,
    businessType: body.businessType,
    category: body.category,
    status: "DRAFT",
    domain: null,
    templateId: body.templateId,
    thumbnailUrl: body.thumbnailUrl,
    updatedAt: new Date().toISOString(),
    suspendedAt: null,
    reactivatedAt: null,
  };
  store.unshift(website);
  websiteOwners.push({ websiteId: website.id, ownerId });
  return website;
}

export async function reactivateWebsite(websiteId: string): Promise<Website> {
  const website = await getWebsite(websiteId);
  await delay(300);
  website.status = "LIVE";
  website.suspendedAt = null;
  website.reactivatedAt = new Date().toISOString();
  website.updatedAt = website.reactivatedAt;
  return website;
}

export async function suspendWebsite(websiteId: string): Promise<Website> {
  const website = await getWebsite(websiteId);
  await delay(300);
  website.status = "SUSPENDED";
  website.reactivatedAt = null;
  website.suspendedAt = new Date().toISOString();
  website.updatedAt = website.suspendedAt;
  return website;
}

export async function listBusinessTypes(): Promise<string[]> {
  return businessTypes;
}
