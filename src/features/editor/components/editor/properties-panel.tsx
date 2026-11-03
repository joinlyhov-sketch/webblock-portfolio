"use client";

import { useState } from "react";
import type { Field } from "@puckeditor/core";
import { Add, ArrowRight2, Colorfilter, Edit2, Magicpen, Setting2, SidebarRight } from "iconsax-reactjs";
import { AiAvatar } from "@/components/common/ai-avatar";
import { cn } from "@/lib/utils";
import type { BlockName, SiteRootProps } from "../../types";
import { AiChat } from "./ai-chat";
import { BLOCK_META } from "./block-meta";
import { FieldControl, fieldMeta } from "./field-control";
import { PanelFrame, PanelRail } from "./panel-rail";
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

/**
 * Right panel (Figma "Panel body"): selected block's Content / Layout & Design, or site settings.
 * Dragging its edge narrow folds it into a slim rail (WebBlock AI, Content, Layout & Design icons);
 * each rail icon opens it again there.
 */
export function PropertiesPanel({
  open,
  onOpenChange,
  width,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Panel width in px (the owner can drag it narrower). */
  width: number;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const [aiOpen, setAiOpen] = useState(false);
  const selectedItem = useEditorPuck((s) => s.selectedItem);
  const content = useEditorPuck((s) => s.appState.data.content);
  const root = useEditorPuck((s) => s.appState.data.root);
  const config = useEditorPuck((s) => s.config);
  const dispatch = useEditorPuck((s) => s.dispatch);
  const getSelectorForId = useEditorPuck((s) => s.getSelectorForId);

  const site = root.props as SiteRootProps;

  // Puck types root props loosely here; the page document is validated with zod on save.
  const setRootProps = (patch: Partial<SiteRootProps>) =>
    dispatch({ type: "replaceRoot", root: { ...root, props: { ...site, ...patch } as typeof root.props } });
  const setRootProp = (name: string, value: unknown) => setRootProps({ [name]: value });

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

  const openAt = (section: "ai" | Tab) => {
    setAiOpen(section === "ai");
    if (section !== "ai") setTab(section);
    onOpenChange(true);
  };

  return (
    <PanelFrame
      open={open}
      width={width}
      side="right"
      rail={
        <PanelRail
          label="Block settings"
          show={{ label: "Show settings panel", icon: <SidebarRight variant="Outline" className={cn("transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none", open && "-rotate-180")} />, onClick: () => onOpenChange(true) }}
          items={[
            { label: "WebBlock AI", icon: <Magicpen variant="Outline" />, onClick: () => openAt("ai") },
            { label: "Content", icon: <Edit2 variant="Outline" />, onClick: () => openAt("content") },
            { label: "Layout & Design", icon: <Colorfilter variant="Outline" />, onClick: () => openAt("layout") },
          ]}
        />
      }
    >
      <aside
        aria-label="Block settings"
        style={{ width }}
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] bg-background shadow-card"
      >
        {/* Figma "Panel header · WebBlock AI switch": opens the AI chat in place of the settings. */}
        <div className="px-3 pt-3 pb-2">
          {/* The whole card is the toggle: the button's ::after stretches over the padding and its CTA, so a
              click anywhere on it works. Only the ✕ sits above it (z-10) with its own action. */}
          <div
            className={cn(
              "group/ai relative flex w-full items-center gap-3 rounded-[16px] border p-3 shadow-[0_6px_18px_-12px_rgba(47,107,196,0.5)]",
              "transition-[background-color,border-color,box-shadow,scale] duration-200 ease-out motion-safe:has-[>button:first-child:active]:scale-[0.99]",
              aiOpen
                ? "border-brand-border bg-primary-soft"
                : "border-brand/20 bg-[linear-gradient(125deg,#f0f6ff_0%,#ffffff_60%,#f5f2ff_100%)] hover:border-brand/40 hover:shadow-[0_5px_14px_-10px_rgba(47,107,196,0.3)]",
            )}
          >
            <button
              type="button"
              aria-label={aiOpen ? "Close WebBlock AI chat" : "Edit your site with WebBlock AI"}
              aria-expanded={aiOpen}
              onClick={() => setAiOpen((open) => !open)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none after:absolute after:inset-0 after:rounded-[16px] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
            >
              <AiAvatar className="size-11 ring-2 ring-white shadow-[0_2px_8px_rgba(47,107,196,0.16)]" />
              <span className="min-w-0 flex-1">
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] leading-none font-bold tracking-[0.08em] text-brand-strong">
                  <Magicpen variant="Outline" aria-hidden className="size-3" /> AI SITE EDITOR
                </span>
                <span className={cn("block truncate text-[14px] leading-[18px] font-semibold", aiOpen ? "text-brand-deep" : "text-foreground")}>
                  {aiOpen ? "WebBlock AI" : "Edit your site with AI"}
                </span>
                <span className="block truncate text-[11px] leading-4 text-muted-foreground">
                  {aiOpen ? "Describe a change to continue" : "Tell AI what you’d like to change"}
                </span>
              </span>
              {!aiOpen && (
                <span className="relative z-10 inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-brand-strong px-2.5 text-[11px] font-semibold text-primary-foreground shadow-button transition-[background-color,translate] group-hover/ai:bg-brand-deep motion-safe:group-hover/ai:-translate-y-px">
                  Try AI <ArrowRight2 variant="Outline" aria-hidden className="size-3.5" />
                </span>
              )}
            </button>
            {aiOpen ? (
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setAiOpen(false)}
                className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-brand-deep outline-none transition-[background-color,scale] duration-150 hover:bg-background/70 focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-90"
              >
                <Add variant="Outline" aria-hidden className="size-4 rotate-45" />
              </button>
            ) : null}
          </div>
        </div>

        {aiOpen ? (
          <AiChat />
        ) : (
          <>

            <div className="flex items-center gap-2.5 px-[18px] py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon variant="Outline" aria-hidden className="size-[18px]" />
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

            <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto pb-6 [--puck-field-radius:14px]">
              <FieldList
                key={`${selectedItem?.props.id ?? "root"}-${tab}`}
                fields={fields}
                values={values}
                tab={tab}
                templateId={site.templateId}
                onChange={selectedItem ? setBlockProp : setRootProp}
              />
              {tab === "layout" && (
                <VisualStyle site={site} onChange={setRootProps} />
              )}
              {tab === "content" && !selectedItem && (
                <p className="px-[18px] text-xs text-muted-foreground">
                  These details appear in the header, the Visit us section, the footer and the Contact popup.
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </PanelFrame>
  );
}
