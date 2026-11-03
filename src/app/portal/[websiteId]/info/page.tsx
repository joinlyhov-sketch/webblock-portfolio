import { Suspense } from "react";
import { InfoSkeleton } from "@/components/common/page-skeleton";
import { requireWebsiteOwner } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { BusinessInfoView, getBusinessInfoView } from "@/features/business-info";

export const metadata = { title: "Business information" };

export default async function BusinessInfoPage({
  params,
  searchParams,
}: {
  params: Promise<{ websiteId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { websiteId } = await params;
  const query = await searchParams;
  await requireWebsiteOwner(websiteId);
  // "Edit details" / "Cancel" only change `?edit=`, so `loading.tsx` never shows and the old screen
  // would sit frozen while the server renders. Keying the boundary on the mode shows the skeleton at once.
  return (
    <Suspense key={query.edit === "1" ? "edit" : "view"} fallback={<InfoSkeleton />}>
      <BusinessInfo websiteId={websiteId} query={query} />
    </Suspense>
  );
}

async function BusinessInfo({ websiteId, query }: { websiteId: string; query: SearchParams }) {
  const data = await getBusinessInfoView(websiteId, query);
  return <BusinessInfoView data={data} />;
}
