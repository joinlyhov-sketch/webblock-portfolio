import { ArrowRight, Message, MessageQuestion } from "iconsax-reactjs";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { CONTACT_HASH, faqItems } from "../content";
import { Diamond, DotGrid, GlassOrb } from "./decor";

const supportHref = CONTACT_HASH;

/** "Questions owners ask us." (Figma "06 FAQ"): help card + accordion (first item open). */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative isolate scroll-mt-28 overflow-hidden bg-muted px-4 py-20 sm:px-6 lg:py-24">
      <FaqDecor />

      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 lg:flex-row lg:gap-16">
        <Reveal className="flex flex-col gap-7 lg:w-[400px] lg:shrink-0">
          <h2 id="faq-title" className="text-[clamp(2rem,1.6rem+1.6vw,2.5rem)] leading-[1.155] font-semibold tracking-[-0.0275em] text-foreground">
            Questions owners
            <br /> ask us.
          </h2>

          <div className="group relative isolate flex flex-col items-start overflow-hidden rounded-[26px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_-28px_rgba(35,83,155,0.32)] ring-1 ring-brand/5 backdrop-blur-sm sm:p-7">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 size-48 rounded-full bg-[radial-gradient(circle,rgba(74,137,237,0.16),transparent_70%)] transition-transform duration-500 group-hover:scale-125" />
            <div className="mb-6 flex w-full items-center justify-between">
              <span className="grid size-12 place-items-center rounded-[17px] border border-brand/10 bg-gradient-to-br from-[#eef5ff] to-[#e5edfb] text-brand shadow-[inset_0_1px_0_white]">
                <Message variant="Outline" aria-hidden className="size-[21px]" />
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/10 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-emerald-800">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
                HERE TO HELP
              </span>
            </div>
            <h3 className="text-[21px] font-semibold tracking-[-0.025em] text-foreground">Still have a question?</h3>
            <p className="mt-2.5 text-[15px] leading-7 text-foreground-soft">
              Anything else? Email us at
            </p>
            <a href={supportHref} className="mt-1 inline-flex max-w-full items-center gap-2 break-all text-[15px] font-medium text-brand-strong underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand-dark hover:decoration-brand">
              {siteConfig.supportEmail}
            </a>
            <div className="my-6 h-px w-full bg-gradient-to-r from-brand/15 via-brand/10 to-transparent" />
            <Button asChild size="lp-md" className="group/button h-12 gap-3 px-6 shadow-[0_8px_18px_-8px_rgba(45,105,199,0.7)]">
              <a href={supportHref}>
                Mail to us <ArrowRight variant="Outline" aria-hidden className="size-4! transition-transform group-hover/button:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </Reveal>

        <RevealGroup className="min-w-0 flex-1 lg:pt-24">
          <Accordion type="single" collapsible className="flex flex-col gap-2.5">
            {faqItems.map((item, i) => (
              <RevealItem key={item.question} y={12}>
                <AccordionItem value={`faq-${i}`} className="rounded-[14px] border-b-0 bg-background px-5 py-[18px]">
                  <AccordionTrigger className="items-center gap-3.5 py-0 text-lg font-normal text-foreground data-[state=open]:text-brand [&>svg]:size-5 [&>svg]:translate-y-0">
                    <MessageQuestion variant="Outline" aria-hidden className="size-5 shrink-0 text-brand" />
                    <span className="flex-1">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2.5 pb-0 pl-[34px] text-base text-foreground-soft">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </RevealItem>
            ))}
          </Accordion>
        </RevealGroup>
      </div>
    </section>
  );
}

function FaqDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <DotGrid />
      <GlassOrb color="blue" size={360} className="top-[180px] left-[22%]" />
      <GlassOrb color="lavender" size={420} className="top-10 left-[61%]" />
      <GlassOrb color="mint" size={300} className="top-[300px] left-[75%]" />
      <Diamond className="top-[132px] left-[110px] hidden md:block" size={12} />
      <Diamond className="top-[413px] left-[160px] hidden md:block" size={10} delay={0.8} />
      <Diamond className="top-[390px] right-[68px] hidden md:block" size={14} delay={0.4} />
      <Diamond className="top-[513px] right-[134px] hidden md:block" size={10} delay={1.2} />
    </div>
  );
}
