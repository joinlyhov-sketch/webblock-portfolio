import { z } from "zod";

export const idInput = z.uuid("Invalid id.");

const whole = (label: string, max: number) =>
  z.coerce
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} can't be negative.`)
    .max(max, `${label} can be at most ${max.toLocaleString("en-US")}.`);

/** Edit plan form. Price is kept as a decimal string, like the API. */
export const planInput = z.object({
  priceMonthly: z
    .string()
    .trim()
    .regex(/^\d{1,4}(\.\d{1,2})?$/, "Enter a price like 19.99.")
    .transform((v) => Number(v).toFixed(2)),
  websiteLimit: whole("Websites", 100).refine((n) => n >= 1, "At least 1 website."),
  redeploysPerMonth: whole("Redeploys", 10_000),
  productLimit: whole("Products", 100_000),
  monitoring: z.string().trim().min(1, "Describe the monitoring included.").max(60, "Keep it under 60 characters."),
});

export type PlanFormValues = z.input<typeof planInput>;
