import { requireUser } from "@/lib/auth/session";
import { getTemplateView, TemplatePreviewer } from "@/features/templates";
import { getBusinessTypes } from "@/features/websites";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  await requireUser();
  const [template, businessTypes] = await Promise.all([getTemplateView(templateId), getBusinessTypes()]);

  return <TemplatePreviewer template={template} businessTypes={businessTypes} />;
}
