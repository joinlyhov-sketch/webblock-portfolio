import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const art = "absolute max-w-none";

/** Empty list: dashed ring + disc illustration holding `icon`, title, hint and an optional action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[440px] flex-col items-center gap-1.5 px-4 py-10 text-center", className)}>
      <div aria-hidden className="relative size-[104px] shrink-0">
        {/* eslint-disable @next/next/no-img-element -- decorative static art */}
        <img src="/images/empty-state/ring.png" alt="" width={104} height={104} className={`${art} top-0 left-0 size-[104px]`} />
        <img src="/images/empty-state/disc.svg" alt="" className={`${art} top-4 left-4 size-[72px]`} />
        <img src="/images/empty-state/accent-lg.svg" alt="" className={`${art} top-3.5 left-[86px] size-2`} />
        <img src="/images/empty-state/accent-sm.svg" alt="" className={`${art} top-20 left-2.5 size-[5px]`} />
        {/* eslint-enable @next/next/no-img-element */}
        <span className="absolute top-[37px] left-[37px] flex size-[30px] items-center justify-center text-brand [&_svg]:size-[30px]">
          {icon}
        </span>
      </div>
      <div className="h-2.5" />
      <h3 className="text-[17px] font-semibold">{title}</h3>
      <p className="text-[13.5px] leading-[21px] text-muted-foreground">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
