"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { createWebsite } from "./api";
import { createWebsiteInput } from "./schemas";

/** "Use template": creates a website from the template's content and opens it in the editor. */
export async function createWebsiteAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = createWebsiteInput.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please choose a template.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
    };
  }
  let editHref: string;
  try {
    const website = await createWebsite(parsed.data);
    revalidatePath("/websites");
    editHref = `/websites/${website.id}/edit`;
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values: raw };
    throw e;
  }
  redirect(editHref);
}
