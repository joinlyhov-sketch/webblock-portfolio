"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRotateLeft as Undo, ArrowRotateRight as Redo, Export, Eye, Send2 as Rocket } from "iconsax-reactjs";
import { StatusBadge, type StatusMeta } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { DeviceSwitcher, type Device } from "../preview/devices";
import { useEditorPuck } from "./use-editor-puck";

export type SaveState = "draft" | "live" | "unsaved";

const SAVE_STATE = {
  draft: { label: "Draft · not deployed yet", tone: "neutral" },
  live: { label: "Live", tone: "success" },
  unsaved: { label: "Unsaved changes", tone: "warning" },
} satisfies Record<SaveState, StatusMeta>;

/** Figma "Editor top bar": site info + status, undo/redo, device toggle, Save draft / Preview / Deploy. */
export function EditorTopBar({
  siteName,
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
    <header className="flex h-[60px] shrink-0 items-center gap-3.5 rounded-[18px] bg-background px-4 shadow-card">
      <Button asChild variant="ghost" size="icon" aria-label="Back to my websites">
        <Link href="/websites" onClick={onBack}>
          <ArrowLeft />
        </Link>
      </Button>
      <span aria-hidden className="grid size-[30px] shrink-0 grid-cols-2 gap-[3px] rounded-[9px] bg-brand p-[7px] shadow-page-active">
        <span className="rounded-[2.5px] bg-background" />
        <span className="rounded-[2.5px] bg-background/65" />
        <span className="rounded-[2.5px] bg-background/80" />
        <span className="rounded-[2.5px] bg-background" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] leading-[19.5px] font-semibold text-foreground">{siteName}</p>
        <p className="text-xs leading-[18px] text-muted-foreground">Home page</p>
      </div>
      <StatusBadge {...SAVE_STATE[saveState]} className="hidden xl:inline-flex" />

      <div className="flex-1" />
      <div className="flex gap-1">
        <Button variant="secondary" size="icon" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!history.hasPast} onClick={history.back}>
          <Undo />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!history.hasFuture}
          onClick={history.forward}
        >
          <Redo />
        </Button>
      </div>
      <DeviceSwitcher value={device} onChange={onDeviceChange} />
      <div className="flex-1" />

      <Button variant="secondary" onClick={onSave} loading={busy === "save"} disabled={busy !== null}>
        {busy !== "save" && <Export />} Save draft
      </Button>
      <Button variant="secondary" onClick={onPreview} loading={busy === "preview"} disabled={busy !== null}>
        {busy !== "preview" && <Eye />} Preview
      </Button>
      <Button onClick={onDeploy} loading={busy === "deploy"} disabled={busy !== null}>
        {busy !== "deploy" && <Rocket />} Deploy
      </Button>
    </header>
  );
}
