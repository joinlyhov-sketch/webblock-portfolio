// Data access for a website's page document. Mock now; when Spring is ready only the function bodies change.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { mediaAssets, uploadedMedia, websitePages } from "@/mocks/website-pages";
import type { AiMessage, MediaAsset, PageData, WebsitePage } from "./types";

function findPage(websiteId: string): WebsitePage {
  const page = websitePages.find((p) => p.websiteId === websiteId);
  if (!page) throw new ApiError({ title: "Page not found", status: 404, detail: "This website has no page yet." });
  return page;
}

/** GET /websites/{websiteId}/page — the saved draft and the published version. */
export async function getPageData(websiteId: string): Promise<WebsitePage> {
  await delay();
  return structuredClone(findPage(websiteId));
}

/** GET /sites/{websiteId} — public: the deployed page that visitors see. 404 until the first deploy. */
export async function getPublishedPage(websiteId: string): Promise<PageData> {
  await delay();
  const page = websitePages.find((p) => p.websiteId === websiteId);
  if (!page?.published) throw new ApiError({ title: "Site not found", status: 404 });
  return structuredClone(page.published);
}

/** PUT /websites/{websiteId}/page { data } — saves the draft. Visitors still see the published version. */
export async function savePageData(websiteId: string, data: PageData): Promise<WebsitePage> {
  await delay();
  const page = findPage(websiteId);
  const now = new Date().toISOString();
  page.draft = structuredClone(data);
  page.updatedAt = now;
  return structuredClone(page);
}

/**
 * POST /websites/{websiteId}/page/publish — asks the backend to deploy the saved draft.
 * The real backend runs the deploy pipeline (and owns retries); the mock publishes instantly.
 * `idempotencyKey` goes in the `Idempotency-Key` header so a double click never deploys twice.
 */
export async function publishPage(websiteId: string, idempotencyKey: string): Promise<WebsitePage> {
  await delay();
  void idempotencyKey;
  const page = findPage(websiteId);
  const now = new Date().toISOString();
  page.published = structuredClone(page.draft);
  page.publishedAt = now;
  return structuredClone(page);
}

/** GET /websites/{websiteId}/media — images the owner can place on the site. */
export async function listMedia(websiteId: string): Promise<Page<MediaAsset>> {
  await delay();
  findPage(websiteId);
  const uploaded = uploadedMedia.filter((m) => m.websiteId === websiteId).map((m) => m.asset);
  return toPage([...uploaded, ...mediaAssets], { page: 0, size: 100 });
}

/**
 * POST /websites/{websiteId}/media (multipart) — stores an image from the owner's computer.
 * The backend puts it in storage and returns its URL; the mock keeps the bytes in memory and
 * serves them from /api/mock-media/{id}. Newest uploads come first in the library.
 */
export async function uploadMedia(websiteId: string, file: File): Promise<MediaAsset> {
  await delay(400);
  findPage(websiteId);
  const id = crypto.randomUUID();
  const asset: MediaAsset = { id, url: `/api/mock-media/${id}`, name: file.name };
  uploadedMedia.unshift({ websiteId, asset, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) });
  return structuredClone(asset);
}

/** Mock only: the stored file behind an uploaded image URL. With Spring the URL points at storage. */
export async function getMediaFile(assetId: string): Promise<{ type: string; bytes: Uint8Array }> {
  const upload = uploadedMedia.find((m) => m.asset.id === assetId);
  if (!upload) throw new ApiError({ title: "Image not found", status: 404 });
  return { type: upload.type, bytes: upload.bytes };
}

/**
 * POST /websites/{websiteId}/ai/messages { prompt } — asks WebBlock AI to edit the site.
 * The backend runs the model and returns its reply. The mock only answers with a placeholder.
 */
export async function sendAiMessage(websiteId: string, prompt: string): Promise<AiMessage> {
  await delay(700);
  findPage(websiteId);
  void prompt;
  return {
    id: crypto.randomUUID(),
    role: "ASSISTANT",
    text: "WebBlock AI isn’t connected yet, so I can’t change your site from here. You can make this edit in the Content and Layout & Design tabs for now.",
    createdAt: new Date().toISOString(),
  };
}
