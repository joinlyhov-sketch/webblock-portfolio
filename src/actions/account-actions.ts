"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  changePassword,
  removeAvatar,
  saveAvatar,
  saveProfile,
} from "@/service/account-service";
import type { ActionResult } from "./result";

// The sidebar (in the shared layout) shows the name and photo, so every change refreshes the layout.
const refreshAccount = () => revalidatePath("/", "layout");

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const result = await saveProfile(user.id, formData);
  if (result.ok) refreshAccount();
  return result;
}

export async function setPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const result = await changePassword(user.id, formData);
  if (result.ok) refreshAccount();
  return result;
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const result = await saveAvatar(user.id, formData);
  if (result.ok) refreshAccount();
  return result;
}

export async function removeAvatarAction(): Promise<ActionResult> {
  const user = await requireUser();
  const result = await removeAvatar(user.id);
  if (result.ok) refreshAccount();
  return result;
}
