"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { requireWebsiteOwner } from "@/lib/auth/session";
import { publishPage, savePageData } from "./api";
import { pageDataSchema } from "./schemas";
import type { PageData } from "./types";

function invalid(error: z.ZodError): ActionResult<never> {
  const first = error.issues[0];
  return {
    ok: false,
    message: first ? `${first.message} (${first.path.join(" › ")})` : "Some content is not valid.",
  };
}

function revalidateWebsite(websiteId: string) {
  revalidatePath(`/websites/${websiteId}/edit`);
  revalidatePath(`/websites/${websiteId}/preview`);
  revalidatePath(`/sites/${websiteId}`);
  revalidatePath("/websites");
}

/** "Save draft": stores the editor's page document. The live site does not change. */
export async function savePageAction(
  websiteId: string,
  data: PageData,
): Promise<ActionResult<{ savedAt: string }>> {
  await requireWebsiteOwner(websiteId);
  const parsed = pageDataSchema.safeParse(data);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const page = await savePageData(websiteId, parsed.data as PageData);
    revalidateWebsite(websiteId);
    return { ok: true, data: { savedAt: page.updatedAt }, message: "Draft saved" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/**
 * "Deploy": saves the current document, then asks the backend to publish it.
 * The backend owns the deploy pipeline and its retries; this only triggers it.
 * `idempotencyKey` is made once per click so a resubmitted request never deploys twice.
 */
export async function deployPageAction(
  websiteId: string,
  data: PageData,
  idempotencyKey: string,
): Promise<ActionResult<{ publishedAt: string }>> {
  await requireWebsiteOwner(websiteId);
  const parsed = pageDataSchema.safeParse(data);
  if (!parsed.success) return invalid(parsed.error);
  if (!z.uuid().safeParse(idempotencyKey).success) return { ok: false, message: "Please try deploying again." };
  try {
    await savePageData(websiteId, parsed.data as PageData);
    const page = await publishPage(websiteId, idempotencyKey);
    revalidateWebsite(websiteId);
    return { ok: true, data: { publishedAt: page.publishedAt ?? new Date().toISOString() }, message: "Website deployed" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}
