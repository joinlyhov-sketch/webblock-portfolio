import Link from "next/link";
import { ArrowRight2 } from "iconsax-reactjs";

/** "Dashboard > Settings". The last item is the current page. */
export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex h-5 items-center gap-1.5 text-[13px] leading-[19.5px]">
      <Link href="/websites" className="text-muted-foreground transition-colors hover:text-foreground">
        Dashboard
      </Link>
      <ArrowRight2 aria-hidden className="size-3.5 text-muted-foreground" />
      <span aria-current="page" className="font-semibold text-foreground">
        {current}
      </span>
    </nav>
  );
}
