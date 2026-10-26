import type { TemplateKey } from "@/features/editor";

export type TemplateCategory = "CLOTHES" | "FOOD_AND_BEVERAGES" | "TECHNOLOGY";

/** GET /templates — one website design the user can start from. */
export type Template = {
  id: string;
  /** Which design the editor renders. */
  key: TemplateKey;
  name: string;
  /** One line under the name, e.g. "Products, categories and clear prices". */
  description: string;
  category: TemplateCategory;
  thumbnailUrl: string | null;
  /** The sample business shown in the template, e.g. "Petal & Stem". */
  demoBusinessName: string;
};

/** Filters for GET /templates. */
export type TemplateQuery = {
  q?: string;
  category?: TemplateCategory;
};
