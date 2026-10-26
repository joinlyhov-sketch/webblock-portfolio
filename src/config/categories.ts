import type { TemplateCategory } from "@/types/template";

/** Display names for website and template categories. Safe to import in client components. */
export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  CLOTHES: "Clothes",
  FOOD_BEVERAGES: "Food & Beverages",
  TECHNOLOGY: "Technology",
  HANDMADE: "Handmade",
};
