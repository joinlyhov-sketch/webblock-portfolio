import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CleanMonoSite } from "@/components/template-site/clean-mono-site";
import { EverydayStoreSite } from "@/components/template-site/everyday-store-site";
import { SweetPastelSite } from "@/components/template-site/sweet-pastel-site";
import { WarmBoldSite } from "@/components/template-site/warm-bold-site";
import { getTemplateSiteView } from "@/service/template-service";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Template website preview", robots: { index: false } };

/** Public, sidebar-less template website. Loaded inside the preview device frames. */
export default async function TemplateSitePage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const site = await getTemplateSiteView(templateId).catch((e: unknown) => {
    if (e instanceof ApiError) notFound();
    throw e;
  });
  switch (site.slug) {
    case "everyday-store":
      return <EverydayStoreSite content={site.content} />;
    case "sweet-pastel":
      return <SweetPastelSite content={site.content} />;
    case "warm-bold":
      return <WarmBoldSite content={site.content} />;
    case "clean-mono":
      return <CleanMonoSite content={site.content} />;
  }
}
