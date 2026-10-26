// Data access for the user's websites. Mock now; when Spring is ready only the function bodies change.
// The mock reads the session user the way the backend would read it from the session cookie.
import { requireUser } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";
import { mockDelay } from "@/lib/api/mock";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { websiteOwners } from "@/mocks/session";
import { templatePages } from "@/mocks/template-pages";
import { templates } from "@/mocks/templates";
import { websitePages, websites } from "@/mocks/websites";
import type { Website } from "./types";

/** GET /websites — the signed-in user's websites, newest first. */
export async function listWebsites(): Promise<Page<Website>> {
  await mockDelay();
  const user = await requireUser();
  const owned = new Set(websiteOwners.filter((o) => o.ownerId === user.id).map((o) => o.websiteId));
  const items = websites
    .filter((w) => owned.has(w.id))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return toPage(items, { page: 0, size: 50 });
}

/** GET /websites/{websiteId} */
export async function getWebsite(websiteId: string): Promise<Website> {
  await mockDelay();
  const website = websites.find((w) => w.id === websiteId);
  if (!website) throw new ApiError({ title: "Website not found", status: 404 });
  return website;
}

/** POST /websites { templateId } — the backend copies the template's default content into the new site. */
export async function createWebsite(input: { templateId: string }): Promise<Website> {
  await mockDelay();
  const user = await requireUser();
  const template = templates.find((t) => t.id === input.templateId);
  if (!template) throw new ApiError({ title: "Template not found", status: 404 });

  const now = new Date().toISOString();
  const website: Website = {
    id: crypto.randomUUID(),
    name: template.demoBusinessName,
    templateId: template.id,
    templateKey: template.key,
    subdomain: `${template.demoBusinessName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${now.slice(11, 19).replace(/:/g, "")}`,
    status: "DRAFT",
    thumbnailUrl: template.thumbnailUrl,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };
  websites.push(website);
  websiteOwners.push({ websiteId: website.id, ownerId: user.id });
  websitePages.push({
    websiteId: website.id,
    draft: structuredClone(templatePages[template.key]),
    published: null,
    updatedAt: now,
    publishedAt: null,
  });
  return website;
}
