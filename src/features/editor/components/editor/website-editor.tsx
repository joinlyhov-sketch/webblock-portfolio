"use client";

import "@puckeditor/core/puck.css";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Puck, useGetPuck } from "@puckeditor/core";
import { toast } from "@/components/common/toast";
import type { WebsiteStatus } from "@/features/websites";
import { savePageAction } from "../../actions";
import type { MediaAsset, PageData, WebsitePage } from "../../types";
import { editorConfig } from "./editor-config";
import type { Device } from "../preview/devices";
import { useDeploy } from "../preview/use-deploy";
import { EditorCanvas } from "./editor-canvas";
import { MediaContext } from "./editor-context";
import { EditorTopBar, type SaveState } from "./editor-top-bar";
import { PropertiesPanel } from "./properties-panel";
import { StructurePanel } from "./structure-panel";

type Props = {
  websiteId: string;
  siteName: string;
  /** "petalandstem.webblock.com" */
  domain: string | null;
  /** Live and suspended websites get the Portal button in the top bar. */
  status: WebsiteStatus;
  page: WebsitePage;
  media: MediaAsset[];
};

/**
 * The visual editor (Figma "10 Editor · Layout & Design" / "11 Edit Content"), built on Puck.
 * Every website has its own document: it loads the saved draft, and Save / Deploy write it back.
 */
export function WebsiteEditor({ websiteId, siteName, domain, status, page, media }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const savedJson = useRef(JSON.stringify(page.draft));
  const [dirty, setDirty] = useState(false);
  const live = page.publishedAt !== null;
  const [library, setLibrary] = useState(media);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <MediaContext
      value={{ websiteId, media: library, addMedia: (asset) => setLibrary((current) => [asset, ...current]) }}
    >
      <Puck
        config={editorConfig}
        data={page.draft}
        iframe={{ enabled: false }}
        onChange={(data) => setDirty(JSON.stringify(data) !== savedJson.current)}
      >
        <EditorShell
          websiteId={websiteId}
          siteName={siteName}
          domain={domain}
          portalHref={status === "DRAFT" ? null : `/portal/${websiteId}`}
          device={device}
          onDeviceChange={setDevice}
          saveState={dirty ? "unsaved" : live ? "live" : "draft"}
          dirty={dirty}
          onSaved={(data) => {
            savedJson.current = JSON.stringify(data);
            setDirty(false);
          }}
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
  portalHref,
  device,
  onDeviceChange,
  saveState,
  dirty,
  onSaved,
}: {
  websiteId: string;
  siteName: string;
  domain: string | null;
  portalHref: string | null;
  device: Device;
  onDeviceChange: (device: Device) => void;
  saveState: SaveState;
  dirty: boolean;
  onSaved: (data: PageData) => void;
}) {
  const router = useRouter();
  const getPuck = useGetPuck();
  const deploy = useDeploy(websiteId);
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
        domain={domain}
        portalHref={portalHref}
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
            // The backend deploys the saved draft, so save what is on screen first.
            if (!(await save(currentData(), true))) return;
            await deploy();
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
