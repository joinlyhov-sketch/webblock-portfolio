import { requireUser } from "@/lib/auth/session";
import { getTemplateView } from "@/service/template-service";
import { getBusinessTypes } from "@/service/website-service";
import { TemplatePreviewer } from "@/components/template/template-previewer";

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
