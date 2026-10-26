import { getTemplate, getTemplateSite, listTemplates } from "./api";
import type { SearchParams } from "@/lib/table-query";
import { CATEGORY_LABELS } from "@/config/categories";
import type { Template, TemplateCategory } from "./types";
import type { TemplateSite } from "@/features/template-sites/types";

const CATEGORY_BY_PARAM: Record<string, TemplateCategory> = {
  clothes: "CLOTHES",
  "food-beverages": "FOOD_BEVERAGES",
  technology: "TECHNOLOGY",
  handmade: "HANDMADE",
};

/** Options for the "Category" dropdown. `value` is the URL param. */
export const categoryOptions = [
  { value: "", label: "All" },
  ...Object.entries(CATEGORY_BY_PARAM).map(([value, category]) => ({
    value,
    label: CATEGORY_LABELS[category],
  })),
];

export type TemplatesView = {
  templates: Template[];
  q: string;
  category: string;
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export async function getTemplatesView(searchParams: SearchParams): Promise<TemplatesView> {
  const categoryParam = first(searchParams.category);
  const q = first(searchParams.q).trim();
  const page = await listTemplates({ category: CATEGORY_BY_PARAM[categoryParam], q });
  return {
    templates: page.items,
    q,
    category: categoryParam in CATEGORY_BY_PARAM ? categoryParam : "",
  };
}

export async function getTemplateView(templateId: string): Promise<Template> {
  return getTemplate(templateId);
}

export async function getTemplateSiteView(templateId: string): Promise<TemplateSite> {
  return getTemplateSite(templateId);
}
