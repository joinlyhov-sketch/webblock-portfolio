"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRotateLeft as Undo,
  ArrowRotateRight as Redo,
  ExportSquare,
  Eye,
  Global,
  Send2 as Rocket,
} from "iconsax-reactjs";
import { LogoMark } from "@/components/common/logo";
import { StatusBadge, type BadgeStatus } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { DeviceSwitcher, type Device } from "../preview/devices";
import { useEditorPuck } from "./use-editor-puck";

export type SaveState = "draft" | "live" | "unsaved";

const SAVE_STATE = {
  draft: "DRAFT",
  live: "LIVE",
  unsaved: "UNSAVED",
} satisfies Record<SaveState, BadgeStatus>;

/** Notebook with a pencil, matching the Save draft icon reference. */
function SaveDraftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="translate(2.4 2.4) scale(0.8)">
        <path d="M5.5 4.75h11.25A3.25 3.25 0 0 1 20 8v6.25l-5 5H5.5A3.5 3.5 0 0 1 2 15.75v-7.5a3.5 3.5 0 0 1 3.5-3.5Z" />
        <path d="M6.5 5V3.25a1.25 1.25 0 0 1 2.5 0V5m1.5 0V3.25a1.25 1.25 0 0 1 2.5 0V5m1.5 0V3.25a1.25 1.25 0 0 1 2.5 0V5m1.5 0V3.25a1.25 1.25 0 0 1 2.5 0V5" />
        <path d="M6 9h10.5M6 12.5h10.5M6 16h6" />
        <path d="m14.75 18.25-.8 3.3 3.3-.8 6.05-6.05a1.77 1.77 0 0 0-2.5-2.5l-6.05 6.05Z" />
        <path d="m19.5 13.5 2.5 2.5" />
      </g>
    </svg>
  );
}

/**
 * Figma "Editor top bar": a flat full-width bar with site info, undo/redo + device toggle in the middle
 * and Save draft / Preview / Deploy. A website that has been deployed (`portalHref` set, Figma
 * "17 Editor (live)") also shows its address and a Portal button.
 */
export function EditorTopBar({
  siteName,
  domain,
  portalHref,
  saveState,
  device,
  onDeviceChange,
  onBack,
  onSave,
  onPreview,
  onDeploy,
  busy,
}: {
  siteName: string;
  domain: string | null;
  /** Owner Portal link, only for live and suspended websites. */
  portalHref: string | null;
  saveState: SaveState;
  device: Device;
  onDeviceChange: (device: Device) => void;
  onBack: (e: React.MouseEvent) => void;
  onSave: () => void;
  onPreview: () => void;
  onDeploy: () => void;
  busy: "save" | "preview" | "deploy" | null;
}) {
  const history = useEditorPuck((s) => s.history);

  return (
    // Below 768px the actions wrap onto a second row so Save / Preview / Deploy are never cut off.
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-5 max-md:h-auto max-md:flex-wrap max-md:gap-2 max-md:px-3 max-md:py-2">
      <Button asChild variant="ghost" size="icon" aria-label="Back to my websites">
        <Link href="/websites" onClick={onBack}>
          <ArrowLeft variant="Outline" />
        </Link>
      </Button>
      <LogoMark className="h-[30px] shrink-0 max-sm:hidden" />
      <div className="min-w-0">
        <p className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">{siteName}</p>
        {portalHref && domain ? (
          <p className="flex items-center gap-1 text-xs leading-[18px] text-muted-foreground">
            <Global variant="Outline" aria-hidden className="size-[11px] shrink-0" />
            <span className="truncate">{domain}</span>
          </p>
        ) : (
          <p className="text-xs leading-[18px] text-muted-foreground">Home page</p>
        )}
      </div>
      {saveState === "unsaved" && <StatusBadge status={SAVE_STATE[saveState]} className="hidden xl:inline-flex" />}

      <div className="flex-1" />
      <div className="flex gap-2">
        <Button variant="secondary" size="icon" className="rounded-full" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!history.hasPast} onClick={history.back}>
          <Undo variant="Outline" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!history.hasFuture}
          onClick={history.forward}
        >
          <Redo variant="Outline" />
        </Button>
      </div>
      {/* Previewing other devices only makes sense on a laptop-sized screen. */}
      <div className="max-lg:hidden">
        <DeviceSwitcher value={device} onChange={onDeviceChange} />
      </div>
      <div className="flex-1 max-md:hidden" />

      {/* On phones: a full-width second row, icon-only except Deploy (labels stay for screen readers). */}
      <div className="flex items-center gap-3 max-md:basis-full max-md:justify-end max-md:gap-2">
        <Button variant={portalHref ? "ghost" : "secondary"} onClick={onSave} loading={busy === "save"} disabled={busy !== null}>
          {busy !== "save" && <SaveDraftIcon />} <span className="max-sm:sr-only">Save draft</span>
        </Button>
        {portalHref && (
          <>
            <span aria-hidden className="h-7 w-px shrink-0 bg-border" />
            <Button asChild variant="secondary">
              {/* The portal opens in its own tab, so the editor (and any unsaved work) stays open here. */}
              <Link href={portalHref} target="_blank" rel="noopener noreferrer">
                <ExportSquare variant="Outline" /> <span className="max-sm:sr-only">Portal</span>
              </Link>
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={onPreview} loading={busy === "preview"} disabled={busy !== null}>
          {busy !== "preview" && <Eye variant="Outline" />} <span className="max-sm:sr-only">Preview</span>
        </Button>
        <Button onClick={onDeploy} loading={busy === "deploy"} disabled={busy !== null}>
          {busy !== "deploy" && <Rocket variant="Outline" />} Deploy
        </Button>
      </div>
    </header>
  );
}
