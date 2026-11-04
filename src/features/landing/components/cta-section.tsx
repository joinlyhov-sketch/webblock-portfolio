import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/common/motion";
import { Button } from "@/components/ui/button";
import { CONTACT_HASH } from "../content";

/** "Get your business online today" band (Figma "07 Get started"). */
export function CtaSection() {
  return (
    <section id="cta" aria-labelledby="cta-title" className="scroll-mt-28 relative isolate overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <Reveal y={24} className="mx-auto max-w-[1280px]">
        <div className="relative isolate flex flex-col items-center gap-6 overflow-hidden rounded-[24px] border border-cta-border bg-linear-[160deg] from-cta-from via-cta-via via-40% to-cta-to to-70% px-6 py-14 text-center shadow-cta sm:rounded-[32px] sm:px-16 sm:py-20">
          <Image aria-hidden src="/landing/decor/cta-glow-left.svg" alt="" width={480} height={480} className="pointer-events-none absolute top-[104px] -left-[211px] -z-10 max-w-none" />
          <Image aria-hidden src="/landing/decor/cta-glow-right.svg" alt="" width={540} height={540} className="pointer-events-none absolute -top-[211px] -right-[189px] -z-10 max-w-none" />

          <h2 id="cta-title" className="text-[clamp(2.25rem,1.5rem+3vw,3.5rem)] leading-[1.12] font-semibold tracking-[-0.02em] text-foreground">
            Get your business <span className="text-brand">online today</span>
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Start free for 14 days. No card needed.
          </p>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lp-lg">
              <Link href="/register">Build your website free</Link>
            </Button>
            <Button asChild variant="outline" size="lp-lg" className="border-cta-border bg-background">
              <a href={CONTACT_HASH}>Mail to us</a>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
