"use client";

import { useState } from "react";
import type { Field } from "@puckeditor/core";
import { ArrowDown2, Magicpen, Setting2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import type { BlockName, SiteRootProps } from "../../types";
import { BLOCK_META } from "./block-meta";
import { FieldControl, fieldMeta } from "./field-control";
import { useEditorPuck } from "./use-editor-puck";
import { VisualStyle } from "./visual-style";

type Tab = "content" | "layout";

/** Fields of one tab, in order, with a grey group title whenever the group changes. */
function FieldList({
  fields,
  values,
  tab,
  templateId,
  onChange,
}: {
  fields: Record<string, Field>;
  values: Record<string, unknown>;
  tab: Tab;
  templateId: SiteRootProps["templateId"];
  onChange: (name: string, value: unknown) => void;
}) {
  const visible = Object.entries(fields).filter(([, field]) => {
    const meta = fieldMeta(field);
    return field.visible !== false && (meta.tab ?? "content") === tab && (!meta.templates || meta.templates.includes(templateId));
  });
  if (visible.length === 0) return null;

  const groups: { title?: string; items: [string, Field][] }[] = [];
  for (const entry of visible) {
    const title = fieldMeta(entry[1]).group;
    const last = groups.at(-1);
    if (last && last.title === title) last.items.push(entry);
    else groups.push({ title, items: [entry] });
  }

  return (
    <>
      {groups.map((group, i) => (
        <section key={`${group.title ?? "main"}-${i}`} className="flex flex-col gap-4 px-[18px] py-4">
          {group.title && <p className="-mb-1 text-xs font-medium text-placeholder">{group.title}</p>}
          {group.items.map(([name, field]) => (
            <FieldControl key={name} name={name} field={field} value={values[name]} onChange={(v) => onChange(name, v)} />
          ))}
        </section>
      ))}
    </>
  );
}

/** Right panel (Figma "Panel body"): selected block's Content / Layout & Design, or site settings. */
export function PropertiesPanel() {
  const [tab, setTab] = useState<Tab>("content");
  const selectedItem = useEditorPuck((s) => s.selectedItem);
  const content = useEditorPuck((s) => s.appState.data.content);
  const root = useEditorPuck((s) => s.appState.data.root);
  const config = useEditorPuck((s) => s.config);
  const dispatch = useEditorPuck((s) => s.dispatch);
  const getSelectorForId = useEditorPuck((s) => s.getSelectorForId);

  const site = root.props as SiteRootProps;

  // Puck types root props loosely here; the page document is validated with zod on save.
  const setRootProp = (name: string, value: unknown) =>
    dispatch({ type: "replaceRoot", root: { ...root, props: { ...site, [name]: value } as typeof root.props } });

  const setBlockProp = (name: string, value: unknown) => {
    if (!selectedItem) return;
    const selector = getSelectorForId(selectedItem.props.id);
    if (!selector) return;
    dispatch({
      type: "replace",
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: { ...selectedItem, props: { ...selectedItem.props, [name]: value } },
    });
  };

  const blockName = selectedItem?.type as BlockName | undefined;
  const meta = blockName ? BLOCK_META[blockName] : undefined;
  const Icon = meta?.icon ?? Setting2;
  const index = selectedItem ? content.findIndex((c) => c.props.id === selectedItem.props.id) : -1;
  const fields = (blockName ? config.components[blockName].fields : config.root?.fields) as Record<string, Field>;
  const values = (selectedItem?.props ?? site) as Record<string, unknown>;

  return (
    <aside
      aria-label="Block settings"
      className="flex w-[384px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-background shadow-card"
    >
      {/* WebBlock AI lives here in Figma; the assistant ships with the backend. */}
      <div className="px-4 pt-3 pb-2">
        <button
          type="button"
          aria-disabled
          title="WebBlock AI is coming soon"
          className="flex w-full items-center gap-2.5 rounded-full bg-segment py-2 pr-2.5 pl-3.5 text-left"
        >
          <Magicpen aria-hidden className="size-4 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">WebBlock AI</span>
            <span className="block text-xs text-placeholder">Coming soon · ask AI to edit your site</span>
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-background">
            <ArrowDown2 aria-hidden className="size-3.5 text-foreground-soft" />
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 px-[18px] py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon aria-hidden className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{meta?.label ?? "Site settings"}</p>
          <p className="text-xs text-muted-foreground">
            {meta ? `Section ${index + 1} of ${content.length}` : "Business info · select a section to edit it"}
          </p>
        </div>
      </div>

      <div className="px-4 pt-1 pb-2">
        <div role="tablist" aria-label="Settings" className="flex rounded-full bg-segment p-1">
          {(
            [
              ["content", "Content"],
              ["layout", "Layout & Design"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "h-9 flex-1 rounded-full text-sm transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                tab === value ? "bg-background font-semibold text-brand-deep shadow-button" : "font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto pb-6">
        <FieldList
          key={`${selectedItem?.props.id ?? "root"}-${tab}`}
          fields={fields}
          values={values}
          tab={tab}
          templateId={site.templateId}
          onChange={selectedItem ? setBlockProp : setRootProp}
        />
        {tab === "layout" && (
          <VisualStyle site={site} onChange={(name, value) => setRootProp(name, value)} />
        )}
        {tab === "content" && !selectedItem && (
          <p className="px-[18px] text-xs text-muted-foreground">
            These details appear in the header, the Visit us section, the footer and the Contact popup.
          </p>
        )}
      </div>
    </aside>
  );
}
