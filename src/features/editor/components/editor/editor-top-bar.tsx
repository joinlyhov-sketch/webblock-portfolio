"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRotateLeft as Undo,
  ArrowRotateRight as Redo,
  DocumentDownload,
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
      {/* Capped so a long name never pushes the device switcher around. */}
      <div className="min-w-0 max-w-[280px]">
        {/* Name and subdomain come from the API: one line each, "…" when too long (full text on hover). */}
        <p title={siteName} className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">
          {siteName}
        </p>
        {portalHref && domain ? (
          <p className="flex min-w-0 items-center gap-1 text-xs leading-[18px] text-muted-foreground">
            <Global variant="Outline" aria-hidden className="size-[11px] shrink-0" />
            <span title={domain} className="min-w-0 truncate">
              {domain}
            </span>
          </p>
        ) : (
          <p className="text-xs leading-[18px] text-muted-foreground">Home page</p>
        )}
      </div>
      {saveState === "unsaved" && <StatusBadge status={SAVE_STATE[saveState]} className="hidden shrink-0 xl:inline-flex" />}

      <div className="flex-1" />
      <div className="flex shrink-0 gap-2">
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
      <div className="shrink-0 max-lg:hidden">
        <DeviceSwitcher value={device} onChange={onDeviceChange} />
      </div>
      <div className="flex-1 max-md:hidden" />

      {/* On phones: a full-width second row, icon-only except Deploy (labels stay for screen readers). */}
      <div className="flex shrink-0 items-center gap-3 max-md:basis-full max-md:justify-end max-md:gap-2">
        <Button variant={portalHref ? "ghost" : "secondary"} onClick={onSave} loading={busy === "save"} disabled={busy !== null}>
          {busy !== "save" && <DocumentDownload variant="Linear" aria-hidden />} <span className="max-sm:sr-only">Save draft</span>
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
