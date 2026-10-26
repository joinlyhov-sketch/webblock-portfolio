"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireWebsiteOwner } from "@/lib/auth/session";
import {
  createWebsiteFromTemplate,
  reactivate,
  suspend,
} from "./service";
import type { ActionResult } from "@/lib/actions/result";

/** Step "Use template": creates a draft website from the business form. */
export async function createWebsiteFromTemplateAction(
  templateId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const result = await createWebsiteFromTemplate(user.id, templateId, formData);
  if (result.ok) revalidatePath("/websites");
  return result;
}

export async function reactivateWebsiteAction(websiteId: string): Promise<ActionResult> {
  await requireWebsiteOwner(websiteId);
  const result = await reactivate(websiteId);
  if (result.ok) revalidatePath("/websites");
  return result;
}

export async function suspendWebsiteAction(websiteId: string): Promise<ActionResult> {
  await requireWebsiteOwner(websiteId);
  const result = await suspend(websiteId);
  if (result.ok) revalidatePath("/websites");
  return result;
}
