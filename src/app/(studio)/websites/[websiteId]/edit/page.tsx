import type { Metadata } from "next";
import { getPageData, listMedia, WebsiteEditor } from "@/features/editor";
import { getWebsite } from "@/features/websites";
import { requireWebsiteOwner } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editor" };

export default async function EditPage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  await requireWebsiteOwner(websiteId);
  const [website, page, media] = await Promise.all([getWebsite(websiteId), getPageData(websiteId), listMedia(websiteId)]);
  return (
    <WebsiteEditor
      websiteId={websiteId}
      siteName={website.name}
      domain={website.domain}
      status={website.status}
      page={page}
      media={media.items}
    />
  );
}

