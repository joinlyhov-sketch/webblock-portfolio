import Form from "next/form";
import { Layer, Magicpen, SearchNormal1 } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import type { Template, TemplateQuery } from "../types";
import { CategoryFilter } from "./category-filter";
import { TemplateCard } from "./template-card";

/** Figma "08 Templates": hero with search, count + category filter, card grid (or empty state). */
export function TemplatesView({ data, query }: { data: Page<Template>; query: TemplateQuery }) {
  return (
    <div className="flex flex-col gap-[15px]">
      <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
        Dashboard <span aria-hidden>›</span> <span className="font-semibold text-foreground">Templates</span>
      </nav>

      <section className="bg-dot-grid relative overflow-hidden rounded-[28px] border border-border px-6 pt-7 pb-16">
        <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-background py-[5px] pr-3 pl-2.5 text-xs font-medium text-brand">
            <Magicpen aria-hidden className="size-3.5" /> Choose the one that matches your business
          </span>
          <h1 className="mt-5 text-[44px] leading-[48px] font-semibold tracking-[-1.2px] text-foreground">
            Start from a website that
            <br />
            already <span className="text-primary">looks like yours</span>
          </h1>
          <p className="mt-2.5 max-w-[780px] text-[15px] leading-[22.5px] text-muted-foreground">
            Same pages, different look. Pick the style that fits your brand, then swap in your name, photos and prices.
          </p>
          <Form action="" role="search" className="mt-6 flex h-14 w-full max-w-[560px] items-center gap-2.5 rounded-full border border-border bg-background pr-1.5 pl-[22px] shadow-card">
            {query.category && <input type="hidden" name="category" value={query.category} />}
            <SearchNormal1 aria-hidden className="size-[17px] text-muted-foreground" />
            <label htmlFor="template-search" className="sr-only">
              Search templates
            </label>
            <input
              id="template-search"
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="Search templates, e.g. “minimal”"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
            />
            <Button type="submit" size="icon-lg" aria-label="Search" className="size-11 bg-primary">
              <SearchNormal1 />
            </Button>
          </Form>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          {data.totalItems} {data.totalItems === 1 ? "template" : "templates"}
        </p>
        <CategoryFilter query={query} />
      </div>

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border px-6 py-24 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Layer aria-hidden className="size-[22px]" />
          </span>
          <h2 className="text-[17px] font-semibold text-foreground">No templates match yet</h2>
          <p className="max-w-md text-[13px] text-muted-foreground">
            Try another search or category, or choose All categories to see every template.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2 xl:grid-cols-4">
          {data.items.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
