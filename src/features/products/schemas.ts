import { z } from "zod";

/** Character limits, shared by the schema and the form inputs (`maxLength`). */
export const PRODUCT_LIMITS = { name: 120, category: 40, description: 300 };
const LIMITS = PRODUCT_LIMITS;

export const productInput = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(LIMITS.name, `Use ${LIMITS.name} characters or fewer.`),
  category: z.string().trim().min(1, "Choose a category.").max(LIMITS.category),
  description: z
    .string()
    .trim()
    .min(10, "Describe the product in at least 10 characters.")
    .max(LIMITS.description, `Use ${LIMITS.description} characters or fewer.`),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a price like 12 or 12.50.")
    // Stored as a decimal string with two places, like the API returns it.
    .transform((value) => Number(value).toFixed(2)),
});

export type ProductInput = z.infer<typeof productInput>;
