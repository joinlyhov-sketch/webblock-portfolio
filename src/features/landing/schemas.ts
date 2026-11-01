// Contact form rules. The dialog checks them in the browser; the service checks them again on the server.
import { z } from "zod";
import { EMAIL_MAX, FULL_NAME_MAX } from "@/lib/validation/fields";

/** Character limits of the contact form, also used as `maxLength`. */
export const CONTACT_LIMITS = { name: FULL_NAME_MAX, email: EMAIL_MAX, message: 2000 };

export const contactInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(CONTACT_LIMITS.name, `Use ${CONTACT_LIMITS.name} characters or fewer.`),
  email: z
    .email("Enter a valid email address.")
    .max(CONTACT_LIMITS.email, `Use ${CONTACT_LIMITS.email} characters or fewer.`),
  message: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters.")
    .max(CONTACT_LIMITS.message, `Use ${CONTACT_LIMITS.message} characters or fewer.`),
});

export type ContactInput = z.infer<typeof contactInput>;
export type FieldErrors = Partial<Record<string, string[]>>;

/** Validate the submitted contact form. Used by the dialog and by the service. */
export function parseContact(
  values: Record<string, unknown>,
): { ok: true; data: ContactInput } | { ok: false; fieldErrors: FieldErrors } {
  const parsed = contactInput.safeParse(values);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
}
