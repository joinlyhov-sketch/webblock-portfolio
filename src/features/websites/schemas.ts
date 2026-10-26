import { z } from "zod";

/** "Use template" form. */
export const createWebsiteInput = z.object({
  templateId: z.uuid("Choose a template."),
});
