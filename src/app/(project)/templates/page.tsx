import { getTemplates, TemplatesView, type TemplateCategory, type TemplateQuery } from "@/features/templates";
import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

const CATEGORIES: TemplateCategory[] = ["CLOTHES", "FOOD_AND_BEVERAGES", "TECHNOLOGY"];

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireUser();
  const { q, category } = await searchParams;
  const query: TemplateQuery = {
    q: typeof q === "string" ? q : undefined,
    category: CATEGORIES.find((c) => c === category),
  };
  const data = await getTemplates(query);
  return <TemplatesView data={data} query={query} />;
}
