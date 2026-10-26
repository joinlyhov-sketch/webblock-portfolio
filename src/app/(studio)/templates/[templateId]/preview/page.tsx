import type { Metadata } from "next";
import { PreviewShell } from "@/features/editor";
import { getTemplate, getTemplatePage, UseTemplateButton } from "@/features/templates";
import { createWebsiteAction } from "@/features/websites";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Template preview" };

export default async function TemplatePreviewPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  await requireUser();
  const [template, data] = await Promise.all([getTemplate(templateId), getTemplatePage(templateId)]);
  return (
    <PreviewShell
      data={data}
      backHref="/templates"
      backLabel="Back to templates"
      domain={`${template.name} · sample content`}
      badge={`${template.name} template`}
      action={<UseTemplateButton templateId={template.id} createAction={createWebsiteAction} size="md" />}
    />
  );
}
