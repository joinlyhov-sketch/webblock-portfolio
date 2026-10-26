import { PageSkeleton } from "@/components/common/page-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-32 pb-16 sm:px-6">
      <PageSkeleton />
    </div>
  );
}
