// Data access for a website's page document. Mock now; when Spring is ready only the function bodies change.
import { ApiError } from "@/lib/api/errors";
import { mockDelay } from "@/lib/api/mock";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { mediaAssets, websitePages, websites } from "@/mocks/websites";
import type { MediaAsset, PageData, WebsitePage } from "./types";

function findPage(websiteId: string): WebsitePage {
  const page = websitePages.find((p) => p.websiteId === websiteId);
  if (!page) throw new ApiError({ title: "Page not found", status: 404, detail: "This website has no page yet." });
  return page;
}

/** GET /websites/{websiteId}/page — the saved draft and the published version. */
export async function getPageData(websiteId: string): Promise<WebsitePage> {
  await mockDelay();
  return structuredClone(findPage(websiteId));
}

/** GET /sites/{websiteId} — public: the deployed page that visitors see. 404 until the first deploy. */
export async function getPublishedPage(websiteId: string): Promise<PageData> {
  await mockDelay();
  const page = websitePages.find((p) => p.websiteId === websiteId);
  if (!page?.published) throw new ApiError({ title: "Site not found", status: 404 });
  return structuredClone(page.published);
}

/** PUT /websites/{websiteId}/page { data } — saves the draft. Visitors still see the published version. */
export async function savePageData(websiteId: string, data: PageData): Promise<WebsitePage> {
  await mockDelay();
  const page = findPage(websiteId);
  const now = new Date().toISOString();
  page.draft = structuredClone(data);
  page.updatedAt = now;
  const website = websites.find((w) => w.id === websiteId);
  if (website) website.updatedAt = now;
  return structuredClone(page);
}

/**
 * POST /websites/{websiteId}/page/publish — asks the backend to deploy the saved draft.
 * The real backend runs the deploy pipeline (and owns retries); the mock publishes instantly.
 * `idempotencyKey` goes in the `Idempotency-Key` header so a double click never deploys twice.
 */
export async function publishPage(websiteId: string, idempotencyKey: string): Promise<WebsitePage> {
  await mockDelay();
  void idempotencyKey;
  const page = findPage(websiteId);
  const now = new Date().toISOString();
  page.published = structuredClone(page.draft);
  page.publishedAt = now;
  const website = websites.find((w) => w.id === websiteId);
  if (website) {
    website.status = "LIVE";
    website.publishedAt = now;
  }
  return structuredClone(page);
}

/** GET /websites/{websiteId}/media — images the owner can place on the site. */
export async function listMedia(websiteId: string): Promise<Page<MediaAsset>> {
  await mockDelay();
  findPage(websiteId);
  return toPage(mediaAssets, { page: 0, size: 100 });
}
