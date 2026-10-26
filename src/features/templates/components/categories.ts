import { Coffee, Monitor, Tag } from "iconsax-reactjs";
import type { TemplateCategory } from "../types";

/** Category pill label + icon (shared by the card and the filter). */
export const CATEGORY = {
  CLOTHES: { label: "Clothes", icon: Tag },
  FOOD_AND_BEVERAGES: { label: "Food & Beverages", icon: Coffee },
  TECHNOLOGY: { label: "Technology", icon: Monitor },
} satisfies Record<TemplateCategory, { label: string; icon: typeof Tag }>;
