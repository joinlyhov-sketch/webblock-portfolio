import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Category,
  DollarCircle,
  DocumentText,
  Element4,
  MessageQuestion,
  PlayCircle,
  ShieldSecurity,
  Sms,
} from "iconsax-reactjs";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { footerColumns } from "../content";

const footerIcons: Record<string, ReactNode> = {
  "How it works": <PlayCircle variant="Outline" aria-hidden className="size-4 shrink-0" />,
  Templates: <Element4 variant="Outline" aria-hidden className="size-4 shrink-0" />,
  Blocks: <Category variant="Outline" aria-hidden className="size-4 shrink-0" />,
  Pricing: <DollarCircle variant="Outline" aria-hidden className="size-4 shrink-0" />,
  "Email support": <Sms variant="Outline" aria-hidden className="size-4 shrink-0" />,
  FAQ: <MessageQuestion variant="Outline" aria-hidden className="size-4 shrink-0" />,
  "Privacy policy": <ShieldSecurity variant="Outline" aria-hidden className="size-4 shrink-0" />,
  "Terms of service": <DocumentText variant="Outline" aria-hidden className="size-4 shrink-0" />,
};

/** Footer (Figma "Footer · Blue"): brand + three link columns + oversized faded wordmark. */
export function LandingFooter() {
  return (
    <footer className="overflow-hidden border-t border-border bg-background pt-16 sm:pt-[72px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-col gap-12 pb-12 lg:flex-row lg:gap-12">
          <div className="flex flex-1 flex-col items-start gap-4">
            <Link href="/" aria-label="WebBlock home" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <Logo size="lg" />
            </Link>
            <p className="text-[15px] leading-6 text-muted-foreground">
              Build your business website. No code required.
            </p>
            <Button asChild size="lp-md" className="h-[42px] px-[18px] text-[15px]">
              <Link href="/register">
                Start free · 14 days <ArrowRight variant="Outline" aria-hidden className="size-[15px]!" />
              </Link>
            </Button>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex lg:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3.5 lg:w-[185px]">
                <h2 className="font-sans text-xs leading-[21px] font-semibold tracking-[0.08em] text-brand uppercase">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-[15px] leading-6 text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary"
                      >
                        {/* Inherits the link colour, so icon and label always change together. */}
                        <span>{footerIcons[link.label]}</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-border py-[30px]">
          <p className="text-[13px] leading-[21px] text-placeholder">
            © {new Date().getFullYear()} WebBlock · Made in Phnom Penh
          </p>
        </div>
      </div>

      {/* Watermark: decorative, clipped at the bottom like the Figma "Watermark clip". */}
      <div aria-hidden className="relative h-[clamp(64px,13vw,224px)] overflow-hidden select-none">
        <p className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 bg-linear-to-b from-brand/16 to-brand/2 to-85% bg-clip-text font-heading text-[clamp(72px,15vw,260px)] leading-none font-semibold tracking-[-0.064em] whitespace-nowrap text-transparent">
          WebBlock
        </p>
      </div>
    </footer>
  );
}
