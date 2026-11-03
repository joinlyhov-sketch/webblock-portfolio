import type { Metadata } from "next";
import { ContactForm } from "@/features/landing";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[760px] flex-col px-4 pt-32 pb-20 sm:px-6 sm:pt-40">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-[0.12em] text-brand uppercase">Contact</p>
        <h1 className="mt-3 font-heading text-4xl leading-tight font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          Talk to our team
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-muted-foreground">
          Have a question about WebBlock? Send us a message and we’ll reply by email.
        </p>
      </div>
      <div className="mt-9 rounded-[24px] border border-border bg-background shadow-card">
        <ContactForm />
      </div>
    </section>
  );
}
