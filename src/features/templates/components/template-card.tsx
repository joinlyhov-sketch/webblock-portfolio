import Image from "next/image";
import Link from "next/link";
import { Layer } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { createWebsiteAction } from "@/features/websites";
import type { Template } from "../types";
import { CATEGORY } from "./categories";
import { UseTemplateButton } from "./use-template-button";

/** Figma "Landing/Template card": page thumbnail, category pill, name, one-liner, Preview + Use template. */
export function TemplateCard({ template }: { template: Template }) {
  const category = CATEGORY[template.category];
  return (
    <article className="flex flex-col gap-[15px] rounded-[20px] border border-border bg-background p-3 shadow-card">
      <div className="relative overflow-hidden rounded-[14px] bg-primary-soft">
        <div className="relative h-[200px] overflow-hidden rounded-t-lg bg-background shadow-card">
          {template.thumbnailUrl ? (
            <Image
              src={template.thumbnailUrl}
              alt={`${template.name} template preview`}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-top"
            />
          ) : (
            <Layer aria-hidden className="absolute inset-0 m-auto size-8 text-placeholder" />
          )}
        </div>
        <span className="absolute top-2.5 right-3 flex items-center gap-[5px] rounded-full bg-background/95 py-[3px] pr-2.5 pl-2 text-xs font-medium text-brand-strong shadow-button">
          <category.icon aria-hidden className="size-3.5" />
          {category.label}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 px-1.5 pb-1.5">
        <div className="flex flex-col gap-[7px]">
          <h2 className="text-[17px] font-semibold text-foreground">{template.name}</h2>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Layer aria-hidden className="size-3.5 shrink-0" />
            {template.description}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link href={`/templates/${template.id}/preview`}>Preview</Link>
          </Button>
          <UseTemplateButton templateId={template.id} createAction={createWebsiteAction} className="flex-1" />
        </div>
      </div>
    </article>
  );
}
