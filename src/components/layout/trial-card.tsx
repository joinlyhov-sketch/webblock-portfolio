import Link from "next/link";
import type { SidebarSummary } from "@/features/account";

/** Plan reminder at the bottom of the user sidebar. */
export function TrialCard({ summary }: { summary: SidebarSummary }) {
  return (
    <section
      aria-label="Your plan"
      className="overflow-hidden rounded-2xl border border-violet-border bg-linear-[165deg] from-trial-from from-8% to-background to-92% p-4"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-background px-2.5 text-xs font-semibold text-brand-strong">
          <span aria-hidden className="size-1.5 rounded-[3px] bg-brand-strong" />
          {summary.planLabel}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {summary.daysLeft} {summary.daysLeft === 1 ? "day" : "days"} left
        </span>
      </div>
      <p className="pt-3 text-[15px] leading-[22.5px] font-semibold text-foreground">
        {summary.liveWebsiteName ? `${summary.liveWebsiteName} is live on trial` : "Your trial is running"}
      </p>
      <div className="pt-3 pb-3.5">
        <div
          role="progressbar"
          aria-label="Trial progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.progress}
          className="h-2 overflow-hidden rounded-full bg-background"
        >
          <div className="h-2 rounded-full bg-brand" style={{ width: `${summary.progress}%` }} />
        </div>
      </div>
      <Link
        href="/billing/plans"
        className="flex h-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-primary-foreground shadow-[0_6px_8px_rgb(47_107_196/0.35),inset_0_1px_0_rgb(219_234_254/0.15)] outline-none transition-colors hover:bg-brand-strong focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
      >
        View plans
      </Link>
    </section>
  );
}
