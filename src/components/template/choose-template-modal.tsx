"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Add, ArrowDown2, Layer, LayoutMaximize, SearchNormal1 } from "iconsax-reactjs";
import { CategoryBadge } from "@/components/common/category-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Modal } from "@/components/common/modal";
import { CATEGORY_LABELS } from "@/config/categories";
import type { Template, TemplateCategory } from "@/types/template";
import { BusinessInfoModal } from "./business-info-modal";

/** "Start a new website": pick a template (search and category work in the browser), then fill the form. */
export function ChooseTemplateModal({
  open,
  onClose,
  templates,
  businessTypes,
}: {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  businessTypes: string[];
}) {
  const [selected, setSelected] = useState<Template | null>(null);

  return (
    <>
      <Modal
        open={open && selected === null}
        onClose={onClose}
        label="Start a new website"
        className="max-w-[1288px]"
      >
        <TemplatePicker templates={templates} onClose={onClose} onUse={setSelected} />
      </Modal>
      <BusinessInfoModal
        template={selected}
        businessTypes={businessTypes}
        onClose={() => {
          setSelected(null);
          onClose();
        }}
      />
    </>
  );
}

function TemplatePicker({
  templates,
  onClose,
  onUse,
}: {
  templates: Template[];
  onClose: () => void;
  onUse: (template: Template) => void;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "">("");

  const categories = useMemo(() => [...new Set(templates.map((t) => t.category))], [templates]);
  const shown = templates.filter(
    (t) =>
      (!category || t.category === category) &&
      (!q.trim() || `${t.name} ${t.description}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <div className="flex items-center justify-between gap-4 p-[15px]">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex size-9 items-center justify-center rounded-[10px] bg-chip text-primary">
            <LayoutMaximize className="size-[18px]" />
          </span>
          <div>
            <h2 className="text-[17px] leading-[22.1px] font-semibold tracking-[-0.17px]">Start a new website</h2>
            <p className="text-xs leading-[18px] text-muted-foreground">Pick a template to begin</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Add aria-hidden className="size-[18px] rotate-45" />
        </button>
      </div>
      <div className="mx-6 h-px shrink-0 bg-border" />

      <div className="flex min-h-0 flex-col gap-[15px] overflow-y-auto p-[15px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex h-11 w-[400px] max-w-full items-center gap-2.5 rounded-full border border-border bg-background px-[14px] focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/25">
            <SearchNormal1 aria-hidden className="size-[17px] shrink-0 text-placeholder" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates, e.g. “minimal”"
              aria-label="Search templates"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <p className="text-[13px] leading-[19.5px] text-muted-foreground" aria-live="polite">
              {shown.length} {shown.length === 1 ? "template" : "templates"}
            </p>
            <label className="relative inline-flex h-[34px] items-center gap-1.5 rounded-full border border-border bg-background px-[14px] text-[13px] leading-[19.5px] font-medium text-foreground-soft">
              <ArrowDown2 aria-hidden className="size-3.5 shrink-0" />
              <span aria-hidden>Category: {category ? CATEGORY_LABELS[category] : "All"}</span>
              <select
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategory | "")}
                className="absolute inset-0 cursor-pointer rounded-full opacity-0"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState
            icon={<Layer />}
            title="No templates found"
            description="Try another category or search, or choose All to see every template."
          />
        ) : (
          <div className="grid gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
            {shown.map((template) => (
              <ChooserCard key={template.id} template={template} onUse={onUse} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Template card of the chooser: taller preview (360px) than the Templates page card. */
function ChooserCard({ template, onUse }: { template: Template; onUse: (template: Template) => void }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-background p-3 shadow-card">
      <div className="relative overflow-hidden rounded-[14px] bg-preview-panel">
        <div className="relative h-[360px] overflow-hidden rounded-t-lg bg-background shadow-[0_10px_30px_rgb(60_120_207/0.12),0_2px_6px_rgb(60_120_207/0.05)]">
          <Image
            src={template.thumbnailUrl}
            alt={`${template.name} template preview`}
            fill
            unoptimized
            sizes="300px"
            className="object-cover object-top"
          />
        </div>
        <CategoryBadge category={template.category} className="absolute top-2.5 right-2.5 shadow-none" />
      </div>
      <div className="flex h-[90px] flex-col gap-2.5 overflow-hidden px-1.5 pb-1.5">
        <div className="flex flex-col gap-[5px]">
          <h3 className="text-[17px] font-semibold text-foreground">{template.name}</h3>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Layer aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{template.description}</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href={`/templates/${template.id}/preview`}
            className="flex flex-1 items-center justify-center rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-button outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Preview
          </Link>
          <button
            type="button"
            onClick={() => onUse(template)}
            className="flex h-[31px] flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground outline-none transition-colors hover:bg-brand focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 [&_svg]:size-[15px]"
          >
            <Add aria-hidden /> Use template
          </button>
        </div>
      </div>
    </article>
  );
}
