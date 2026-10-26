import type { Metadata } from "next";
import { DeployButton, getPageData, PreviewShell } from "@/features/editor";
import { getWebsite } from "@/features/websites";
import { requireWebsiteOwner } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  await requireWebsiteOwner(websiteId);
  const [website, page] = await Promise.all([getWebsite(websiteId), getPageData(websiteId)]);
  const domain = `${website.subdomain}.webblock.com`;
  return (
    <PreviewShell
      data={page.draft}
      backHref={`/websites/${websiteId}/edit`}
      backLabel="Back to editor"
      domain={domain}
      badge="Live preview"
      action={<DeployButton websiteId={websiteId} data={page.draft} domain={domain} />}
    />
  );
}
