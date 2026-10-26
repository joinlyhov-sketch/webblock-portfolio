import { Breadcrumb } from "@/components/common/breadcrumb";
import { FilterSelect } from "@/components/common/filter-select";
import { SearchInput } from "@/components/common/search-input";
import { categoryOptions, type TemplatesView as TemplatesData } from "@/service/template-service";
import { TemplatesGrid } from "./templates-grid";

/** "Templates": hero with search, then the count + category filter (in the URL) and the grid. */
export function TemplatesView({
  data,
  businessTypes,
}: {
  data: TemplatesData;
  businessTypes: string[];
}) {
  return (
    <>
      <Breadcrumb current="Templates" />

      <section className="relative h-[357px] shrink-0 overflow-hidden rounded-[28px] border border-border bg-linear-to-b from-[#fbfcff] to-[#f1f5fd]">
        <div aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_70%_90%_at_50%_45%,black,transparent_85%)]" />
        <div
          aria-hidden
          className="absolute top-[65px] left-1/2 h-[260px] w-[760px] max-w-full -translate-x-1/2 bg-[url('/images/hero-glow.svg')] bg-[length:980px_480px] bg-center bg-no-repeat"
        />
        <span aria-hidden className="absolute top-[92px] left-[18%] size-3 -rotate-14 rounded-[3px] bg-primary/35" />
        <span aria-hidden className="absolute top-[215px] right-[17%] size-[9px] rotate-12 rounded-[3px] bg-primary/25" />
        <span aria-hidden className="absolute top-[88px] right-[11%] size-1.5 -rotate-8 rounded-[3px] bg-primary/20" />

        <p className="absolute top-[29px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background py-[5px] pr-3 pl-2.5 text-xs leading-4 font-medium whitespace-pre text-brand backdrop-blur-[4px]">
          <span aria-hidden className="text-sm leading-none">
            ✦
          </span>
          {"choose  which match with your business"}
        </p>

        <div className="absolute top-[71px] left-1/2 flex w-[800px] max-w-full -translate-x-1/2 flex-col items-center px-4 text-center">
          <h1 className="text-[44px] leading-[48px] font-semibold tracking-[-1.2px] text-heading">
            Start from a website that
            <br />
            already <span className="text-primary">looks like yours</span>
          </h1>
          <p className="max-w-[780px] pt-2.5 text-[15px] leading-[22.5px] text-muted-foreground">
            Same pages, different look. Pick the style that fits your brand, then swap in your name, photos and
            prices.
          </p>
        </div>

        <div className="absolute top-[226px] left-1/2 w-[560px] max-w-full -translate-x-1/2 px-4">
          <SearchInput
            variant="hero"
            defaultValue={data.q}
            placeholder="Search templates, e.g. “minimal”"
            label="Search templates"
          />
        </div>
      </section>

      <div className="flex items-center gap-2">
        <p className="text-[13px] leading-[19.5px] text-muted-foreground" aria-live="polite">
          {data.templates.length} {data.templates.length === 1 ? "template" : "templates"}
        </p>
        <span aria-hidden className="h-px flex-1" />
        <FilterSelect label="Category:" param="category" value={data.category} options={categoryOptions} />
      </div>

      <TemplatesGrid templates={data.templates} businessTypes={businessTypes} />
    </>
  );
}
