import type { ReactNode } from "react";
import { Element3 } from "iconsax-reactjs";

/**
 * Full-screen frame of the Deploy screens (Figma "13 First Deploy", "15 Deploying"): the website chip
 * top-right and a soft dotted backdrop. The page never needs a sidebar.
 */
export function DeployShell({
  siteName,
  children,
}: {
  siteName: string;
  children: ReactNode;
}) {
  return (
    <div className="relative -m-page flex min-h-dvh flex-col overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-radial from-card-tint to-transparent to-70%" />
        <div className="absolute top-12 -left-24 size-[420px] bg-[radial-gradient(circle,var(--color-dot)_1.5px,transparent_1.6px)] bg-size-[22px_22px] mask-[radial-gradient(circle,black_30%,transparent_68%)]" />
        <div className="absolute top-40 -right-24 size-[420px] bg-[radial-gradient(circle,var(--color-dot)_1.5px,transparent_1.6px)] bg-size-[22px_22px] mask-[radial-gradient(circle,black_30%,transparent_68%)]" />
      </div>
      <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-end px-5 pt-5">
        <div className="flex items-center gap-2.5 rounded-2xl bg-background py-2 pr-4 pl-2 shadow-card">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground [&_svg]:size-4">
            <Element3 aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="max-w-[200px] truncate text-[14px] leading-[18px] font-semibold text-foreground">
              {siteName}
            </span>
            <span className="text-[13px] leading-[18px] text-muted-foreground">
              Home page
            </span>
          </span>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-[72px] pb-28">
        {children}
      </div>
    </div>
  );
}
