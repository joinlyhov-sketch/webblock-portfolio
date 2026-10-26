// Data access for templates. Mock now; when Spring is ready only the function bodies change.
import type { PageData } from "@/features/editor";
import { ApiError } from "@/lib/api/errors";
import { mockDelay } from "@/lib/api/mock";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { templatePages } from "@/mocks/template-pages";
import { templates } from "@/mocks/templates";
import type { Template, TemplateQuery } from "./types";

/** GET /templates?q=&category= */
export async function getTemplates(query: TemplateQuery = {}): Promise<Page<Template>> {
  await mockDelay();
  const q = query.q?.trim().toLowerCase();
  const items = templates.filter(
    (t) =>
      (!query.category || t.category === query.category) &&
      (!q || `${t.name} ${t.description} ${t.demoBusinessName}`.toLowerCase().includes(q)),
  );
  return toPage(items, { page: 0, size: 50 });
}

/** GET /templates/{templateId} */
export async function getTemplate(templateId: string): Promise<Template> {
  await mockDelay();
  const template = templates.find((t) => t.id === templateId);
  if (!template) throw new ApiError({ title: "Template not found", status: 404 });
  return template;
}

/** GET /templates/{templateId}/page — the template's default content (used by "Preview"). */
export async function getTemplatePage(templateId: string): Promise<PageData> {
  const template = await getTemplate(templateId);
  return templatePages[template.key];
}
