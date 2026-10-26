import type { ReactNode } from "react";
import { AuthLogo } from "./auth-logo";
import { AuthShowcase, type Headline } from "./auth-showcase";

/** Two-column auth frame: logo + centred 424px form on the left, marketing panel on the right. */
export function AuthShell({ headline, children }: { headline: Headline; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh gap-6 bg-background p-4 sm:p-6">
      <div className="flex min-w-0 flex-1 flex-col px-2 py-2 sm:px-8">
        <AuthLogo />
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[424px] flex-col gap-[18px]">{children}</div>
        </main>
      </div>
      <AuthShowcase headline={headline} />
    </div>
  );
}
