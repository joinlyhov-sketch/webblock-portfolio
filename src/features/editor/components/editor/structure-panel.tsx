"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@puckeditor/core";
import { Add, AddSquare, Copy, InfoCircle, Layer, Menu, SidebarLeft, SidebarRight, Trash } from "iconsax-reactjs";
import { Callout } from "@/components/common/callout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGE_BLOCK_LIMIT, addBlockProblem, footerIndex } from "../../block-limits";
import type { BlockName } from "../../types";
import { BLOCK_META, BLOCK_ORDER } from "./block-meta";
import { PanelFrame, PanelRail } from "./panel-rail";
import { useEditorPuck } from "./use-editor-puck";

/** Puck's zone for top-level blocks. */
const ROOT_ZONE = "root:default-zone";

/**
 * Scrolls the canvas to the block at `index`, so choosing a section in the list takes you to it.
 * Puck marks every block's element with `data-puck-component`; it can take a frame to appear after an insert.
 */
function scrollToBlock(index: number) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = () => {
    const canvas = document.getElementById("website-canvas");
    const block = canvas?.querySelectorAll<HTMLElement>("[data-puck-component]")[index];
    block?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };
  requestAnimationFrame(() => requestAnimationFrame(go));
}

/** Keeps the selected row visible when the Page structure list scrolls. */
function revealRow(index: number) {
  requestAnimationFrame(() => {
    document.querySelectorAll("#page-structure > li")[index]?.scrollIntoView({ block: "nearest" });
  });
}

/** Moves focus to the first button inside `id` once the panel is open again. */
function focusIn(id: string) {
  requestAnimationFrame(() => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ block: "nearest" });
    section?.querySelector<HTMLElement>("button")?.focus();
  });
}

/**
 * Figma left panel: "Page structure" (select, duplicate, delete, drag to reorder) + "Add a block".
 * The sidebar icon next to the title (or dragging its edge narrow) folds it into a slim rail (sidebar,
 * Page structure and Add a block icons) so the website gets more room; each rail icon opens it again.
 */
export function StructurePanel({
  open,
  onOpenChange,
  width,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Panel width in px (the owner can drag it narrower). */
  width: number;
}) {
  const content = useEditorPuck((s) => s.appState.data.content);
  const itemSelector = useEditorPuck((s) => s.appState.ui.itemSelector);
  const dispatch = useEditorPuck((s) => s.dispatch);
  const refreshPermissions = useEditorPuck((s) => s.refreshPermissions);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const selectedIndex = itemSelector && (itemSelector.zone ?? ROOT_ZONE) === ROOT_ZONE ? itemSelector.index : -1;
  const footer = footerIndex(content);
  const full = content.length >= PAGE_BLOCK_LIMIT;

  // The Footer always stays last: a block dropped below it on the canvas puts it back at the end.
  useEffect(() => {
    if (footer !== -1 && footer !== content.length - 1) {
      dispatch({ type: "reorder", sourceIndex: footer, destinationIndex: content.length - 1, destinationZone: ROOT_ZONE });
    }
  }, [footer, content.length, dispatch]);

  // Puck only re-checks a block's Duplicate permission when that block changes; the limits depend on the
  // whole page, so re-check every block whenever blocks are added, removed or reordered.
  const blockTypes = content.map((item) => item.type).join();
  useEffect(() => {
    void refreshPermissions();
  }, [blockTypes, refreshPermissions]);

  const select = (index: number | null) => {
    dispatch({ type: "setUi", ui: { itemSelector: index === null ? null : { index, zone: ROOT_ZONE } } });
    if (index !== null) {
      scrollToBlock(index);
      revealRow(index);
    }
  };

  const insert = (type: BlockName) => {
    if (addBlockProblem(content, type)) return;
    const after = selectedIndex >= 0 ? selectedIndex + 1 : content.length;
    // New blocks go above the Footer; a new Footer goes at the end.
    const index = type === "Footer" ? content.length : footer === -1 ? after : Math.min(after, footer);
    dispatch({ type: "insert", componentType: type, destinationIndex: index, destinationZone: ROOT_ZONE });
    select(index);
  };

  const move = (from: number, requested: number) => {
    if (from === footer) return;
    const to = footer === -1 ? requested : Math.min(requested, footer - 1);
    if (from === to) return;
    dispatch({ type: "reorder", sourceIndex: from, destinationIndex: to, destinationZone: ROOT_ZONE });
    select(to);
  };

  const openAt = (section: "page-structure" | "add-block-list") => {
    onOpenChange(true);
    focusIn(section);
  };

  return (
    <PanelFrame
      open={open}
      width={width}
      side="left"
      rail={
        <PanelRail
          label="Page"
          show={{ label: "Show page panel", icon: <SidebarRight variant="Outline" className={cn("transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none", open && "rotate-180")} />, onClick: () => onOpenChange(true) }}
          items={[
            { label: "Page structure", icon: <Layer variant="Outline" />, onClick: () => openAt("page-structure") },
            { label: "Add a block", icon: <AddSquare variant="Outline" />, onClick: () => openAt("add-block-list") },
          ]}
        />
      }
    >
      <aside
        aria-label="Page"
        style={{ width }}
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] bg-background shadow-card"
      >
        {/* Capped at about half the panel: a long page scrolls its list instead of pushing "Add a block" away. */}
        <section className="flex max-h-[55%] min-h-0 shrink-0 flex-col p-4">
          <div className="flex shrink-0 items-center gap-2.5">
            <h2 className="flex-1 font-sans whitespace-nowrap text-[13px] font-semibold text-foreground">Page structure</h2>
            <span className="min-w-0 truncate text-[11px] font-medium text-placeholder">Drag to reorder</span>
            <span
              aria-label={`${content.length} of ${PAGE_BLOCK_LIMIT} blocks used`}
              className={cn("shrink-0 text-[11px] font-semibold tabular-nums", full ? "text-brand-deep" : "text-muted-foreground")}
            >
              {content.length}/{PAGE_BLOCK_LIMIT}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Hide page panel"
              aria-expanded
              title="Hide page panel"
              className="size-7 [&_svg]:size-4"
              onClick={() => onOpenChange(false)}
            >
              <SidebarLeft variant="Outline" className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none" />
            </Button>
          </div>

          {content.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              Your page is empty. Add a block below.
            </p>
          ) : (
            <ol id="page-structure" className="editor-scrollbar -mx-1 mt-3 flex min-h-0 flex-col gap-0.5 overflow-y-auto px-1">
              {content.map((item, index) => {
                const meta = BLOCK_META[item.type as BlockName];
                const Icon = meta.icon;
                const selected = index === selectedIndex;
                const isFooter = index === footer;
                const duplicateProblem = addBlockProblem(content, item.type as BlockName);
                return (
                  <li
                    key={item.props.id}
                    draggable={!isFooter}
                    onDragStart={(e) => {
                      setDragFrom(index);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(index);
                    }}
                    onDragEnd={() => {
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom !== null) move(dragFrom, index);
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    className={cn(
                      "group flex h-[38px] shrink-0 items-center gap-2.5 rounded-xl border pr-2.5 pl-3 transition-colors",
                      selected ? "border-brand-border bg-primary-soft" : "border-transparent hover:bg-muted",
                      dragOver === index && dragFrom !== index && "border-dashed border-brand",
                      dragFrom === index && "opacity-50",
                    )}
                  >
                    <button
                      type="button"
                      aria-current={selected || undefined}
                      onClick={() => select(index)}
                      onKeyDown={(e) => {
                        if (e.altKey && e.key === "ArrowUp" && index > 0) move(index, index - 1);
                        if (e.altKey && e.key === "ArrowDown" && index < content.length - 1) move(index, index + 1);
                      }}
                      title={isFooter ? "The footer always stays at the bottom" : "Alt + ↑/↓ to move"}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2.5 text-left text-[13px] outline-none focus-visible:underline",
                        selected ? "font-semibold text-brand-deep" : "font-medium text-foreground",
                      )}
                    >
                      <Icon variant="Outline" aria-hidden className="size-[15px] shrink-0" />
                      <span className="truncate">{meta.label}</span>
                    </button>
                    {selected && (
                      <span className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-[26px] [&_svg]:size-3.5"
                          aria-label={`Duplicate ${meta.label}`}
                          title={duplicateProblem ?? `Duplicate ${meta.label}`}
                          disabled={duplicateProblem !== null}
                          onClick={() => {
                            dispatch({ type: "duplicate", sourceIndex: index, sourceZone: ROOT_ZONE });
                            select(index + 1);
                          }}
                        >
                          <Copy variant="Outline" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-[26px] hover:text-danger [&_svg]:size-3.5"
                          aria-label={`Remove ${meta.label}`}
                          onClick={() => {
                            dispatch({ type: "remove", index, zone: ROOT_ZONE });
                            select(null);
                          }}
                        >
                          <Trash variant="Outline" />
                        </Button>
                      </span>
                    )}
                    <Menu
                      variant="Outline"
                      aria-hidden
                      className={cn("size-[15px] shrink-0 text-placeholder", isFooter ? "invisible" : "cursor-grab")}
                    />
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-1.5">
          <h2 className="font-sans text-[13px] font-semibold text-foreground">Add a block</h2>
          {full && (
            <Callout
              tone="neutral"
              icon={<InfoCircle variant="Outline" className="size-4" />}
              title={`Your page has ${PAGE_BLOCK_LIMIT} of ${PAGE_BLOCK_LIMIT} blocks. Remove one to add another.`}
              className="mt-2.5 text-xs"
            />
          )}
          {/* Puck spaces drawer items with --puck-space-3 (12px); Figma uses 8px between blocks. */}
          <div id="add-block-list" className="editor-scrollbar -mx-1 min-h-0 flex-1 overflow-y-auto px-1 pt-2.5 pb-3 [--puck-space-3:8px]">
            <Drawer>
              {BLOCK_ORDER.map((name) => {
                const meta = BLOCK_META[name];
                const Icon = meta.icon;
                // When the whole page is full the notice above says so; each card only names its own limit.
                const problem = addBlockProblem(content, name);
                const typeProblem = full ? null : problem;
                return (
                  <Drawer.Item key={name} name={name} label={meta.label} isDragDisabled={problem !== null}>
                    {() => (
                      <div
                        title={problem ?? undefined}
                        className={cn(
                          "flex h-[56px] items-center gap-2.5 rounded-[14px] border border-border bg-background pr-3 pl-2.5 shadow-card transition-[border-color,box-shadow,opacity]",
                          problem ? "cursor-not-allowed opacity-55" : "cursor-grab hover:border-primary/40 hover:shadow-button-hover",
                        )}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-brand">
                          <Icon variant="Outline" aria-hidden className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-foreground">{meta.label}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">{typeProblem ?? meta.hint}</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={problem ? `Add ${meta.label} (${problem})` : `Add ${meta.label}`}
                          disabled={problem !== null}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => insert(name)}
                        >
                          <Add variant="Outline" className="text-brand" />
                        </Button>
                      </div>
                    )}
                  </Drawer.Item>
                );
              })}
            </Drawer>
          </div>
        </section>
      </aside>
    </PanelFrame>
  );
}

