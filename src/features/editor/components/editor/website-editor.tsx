"use client";

import "@puckeditor/core/puck.css";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Puck, useGetPuck } from "@puckeditor/core";
import { toast } from "@/components/common/toast";
import { deployPageAction, savePageAction } from "../../actions";
import type { MediaAsset, PageData, WebsitePage } from "../../types";
import { puckConfig } from "../puck-config";
import type { Device } from "../preview/devices";
import { EditorCanvas } from "./editor-canvas";
import { MediaContext } from "./editor-context";
import { EditorTopBar, type SaveState } from "./editor-top-bar";
import { PropertiesPanel } from "./properties-panel";
import { StructurePanel } from "./structure-panel";

type Props = {
  websiteId: string;
  siteName: string;
  /** "petalandstem.webblock.com" */
  domain: string;
  page: WebsitePage;
  media: MediaAsset[];
};

/**
 * The visual editor (Figma "10 Editor · Layout & Design" / "11 Edit Content"), built on Puck.
 * Every website has its own document: it loads the saved draft, and Save / Deploy write it back.
 */
export function WebsiteEditor({ websiteId, siteName, domain, page, media }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const savedJson = useRef(JSON.stringify(page.draft));
  const [dirty, setDirty] = useState(false);
  const [live, setLive] = useState(page.publishedAt !== null);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <MediaContext value={media}>
      <Puck
        config={puckConfig}
        data={page.draft}
        iframe={{ enabled: false }}
        onChange={(data) => setDirty(JSON.stringify(data) !== savedJson.current)}
      >
        <EditorShell
          websiteId={websiteId}
          siteName={siteName}
          domain={domain}
          device={device}
          onDeviceChange={setDevice}
          saveState={dirty ? "unsaved" : live ? "live" : "draft"}
          dirty={dirty}
          onSaved={(data) => {
            savedJson.current = JSON.stringify(data);
            setDirty(false);
          }}
          onDeployed={() => setLive(true)}
        />
      </Puck>
    </MediaContext>
  );
}

/** Lives inside <Puck> so it can read the current document. */
function EditorShell({
  websiteId,
  siteName,
  domain,
  device,
  onDeviceChange,
  saveState,
  dirty,
  onSaved,
  onDeployed,
}: {
  websiteId: string;
  siteName: string;
  domain: string;
  device: Device;
  onDeviceChange: (device: Device) => void;
  saveState: SaveState;
  dirty: boolean;
  onSaved: (data: PageData) => void;
  onDeployed: () => void;
}) {
  const router = useRouter();
  const getPuck = useGetPuck();
  const [busy, setBusy] = useState<"save" | "preview" | "deploy" | null>(null);
  const [, startTransition] = useTransition();
  const currentData = () => getPuck().appState.data as PageData;

  /** Saves the draft; returns false (and shows why) on failure. */
  const save = async (data: PageData, quiet = false) => {
    const result = await savePageAction(websiteId, data);
    if (!result.ok) {
      toast.error("Couldn't save your changes", result.message);
      return false;
    }
    onSaved(data);
    if (!quiet) toast.success("Draft saved", "Visitors still see your last deployed version.");
    return true;
  };

  const run = (kind: "save" | "preview" | "deploy", task: () => Promise<void>) => {
    setBusy(kind);
    startTransition(async () => {
      try {
        await task();
      } finally {
        setBusy(null);
      }
    });
  };

  return (
    <div className="flex h-[calc(100dvh-2*var(--spacing-page))] min-h-[640px] flex-col gap-3">
      <EditorTopBar
        siteName={siteName}
        saveState={saveState}
        device={device}
        onDeviceChange={onDeviceChange}
        busy={busy}
        onBack={(e) => {
          if (dirty && !window.confirm("You have unsaved changes. Leave the editor anyway?")) e.preventDefault();
        }}
        onSave={() => run("save", async () => void (await save(currentData())))}
        onPreview={() =>
          run("preview", async () => {
            if (dirty && !(await save(currentData(), true))) return;
            router.push(`/websites/${websiteId}/preview`);
          })
        }
        onDeploy={() =>
          run("deploy", async () => {
            const data = currentData();
            const result = await deployPageAction(websiteId, data, crypto.randomUUID());
            if (!result.ok) {
              toast.error("Couldn't deploy", result.message);
              return;
            }
            onSaved(data);
            onDeployed();
            toast.success("Website deployed", `Your changes are live at ${domain}.`);
          })
        }
      />
      <div className="flex min-h-0 flex-1 gap-3">
        <StructurePanel />
        <EditorCanvas device={device} domain={domain} />
        <PropertiesPanel />
      </div>
    </div>
  );
}
