import Image from "next/image";
import { Lock } from "iconsax-reactjs";

const STEPS = [
  { title: "Pick a template", detail: "Ready-made designs" },
  { title: "Add your details", detail: "Name, hours, contact" },
  { title: "Publish", detail: "Live on webblock.com" },
];

/** Two-line headline; line 2 is `line2` (optional) followed by the blue `accent`. */
export type Headline = { line1: string; line2?: string; accent: string };

/** Right-hand marketing panel: headline, desktop + phone preview of a template, 3 steps. */
export function AuthShowcase({ headline }: { headline: Headline }) {
  return (
    <aside className="relative hidden w-[743px] max-w-[46%] shrink-0 flex-col justify-between gap-10 overflow-hidden rounded-[32px] border border-brand-soft bg-muted p-10 lg:flex xl:p-[55px]">
      <p className="font-heading text-5xl leading-[1.06] font-semibold tracking-[-1.6px] text-foreground xl:text-[64px] xl:tracking-[-2.2px]">
        {headline.line1}
        <br />
        {headline.line2 && `${headline.line2} `}
        <span className="text-primary">{headline.accent}</span>
      </p>

      <div aria-hidden className="relative w-full max-w-[644px]">
        <BrowserPreview />
        <PhonePreview />
      </div>

      <ol className="flex items-center gap-4 rounded-[20px] border border-border bg-background/80 px-5 py-[18px] shadow-card backdrop-blur-sm">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex min-w-0 flex-1 items-center gap-3">
            {i > 0 && <span aria-hidden className="h-9 w-px shrink-0 bg-border" />}
            <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{step.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function BrowserPreview() {
  return (
    <div className="w-[87.5%] overflow-hidden rounded-[19px] border border-border bg-background shadow-card">
      <div className="flex h-[46px] items-center gap-[7px] border-b border-border bg-muted px-4">
        <span className="size-3 rounded-full bg-danger/40" />
        <span className="size-3 rounded-full bg-warning/40" />
        <span className="size-3 rounded-full bg-success/40" />
        <span className="mx-auto flex h-[29px] items-center gap-[7px] rounded-full border border-border bg-background px-4 text-sm text-muted-foreground">
          <Lock className="size-3.5" />
          petalandstem.webblock.com
        </span>
      </div>
      <div className="relative aspect-[562/410]">
        <Image
          src="/images/auth/template-desktop.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 564px, 0px"
          className="object-cover object-top"
          priority
        />
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="absolute top-[15%] right-0 w-[35.6%] rounded-[41px] bg-foreground p-[6px] shadow-card">
      <div className="relative aspect-[216/446] overflow-hidden rounded-[35px] bg-background">
        <Image
          src="/images/auth/template-mobile.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 216px, 0px"
          className="object-cover object-top pt-[33px]"
        />
        <div className="absolute inset-x-0 top-0 flex h-[33px] items-center bg-background/95 px-6 text-[10px] font-semibold text-foreground">
          9:41
        </div>
        <span className="absolute top-[6.5px] left-1/2 h-[22px] w-[34%] -translate-x-1/2 rounded-full bg-foreground" />
      </div>
    </div>
  );
}
