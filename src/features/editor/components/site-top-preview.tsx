"use client";

import { useMemo } from "react";
import { Eye } from "iconsax-reactjs";
import { ScaleToFit } from "@/components/common/scale-to-fit";
import { Pill } from "@/components/common/status-badge";
import { cn } from "@/lib/utils";
import type { PageData, SiteRootProps } from "../types";
import { SiteRenderer } from "./site-renderer";

/** Desktop size the site is laid out at before it is scaled down to the banner. */
const DESKTOP = { width: 1280, height: 540 };

/**
 * A small, real render of the top of a website (header + first section) at desktop width, scaled to
 * fit. Not clickable. `logoUrl` swaps the logo before it is saved, so the owner sees the change at once.
 */
export function SiteTopPreview({
  data,
  logoUrl,
  label,
  compactLabel,
  className,
}: {
  data: PageData;
  /** Overrides the page's logo (a picked file's preview URL). `undefined` keeps the page's own. */
  logoUrl?: string | null;
  /** Small pill floating over the bottom-right corner, e.g. "Preview: goes live on your next deploy". */
  label?: string;
  /** Shorter text shown instead of `label` below `sm`, where the preview is too small to cover that much of it. */
  compactLabel?: string;
  className?: string;
}) {
  const page = useMemo<PageData>(() => {
    if (logoUrl === undefined) return data;
    const props = { ...(data.root.props as SiteRootProps), logoUrl };
    return { ...data, root: { ...data.root, props } };
  }, [data, logoUrl]);
  const name = (data.root.props as SiteRootProps).businessName;

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-preview-panel", className)}>
      <div role="img" aria-label={`Preview of the top of the ${name} website`}>
        <ScaleToFit width={DESKTOP.width} height={DESKTOP.height} className="mx-auto">
          {/* inert: links, the menu and the Contact button inside the site can't be used from here. */}
          <div inert className="pointer-events-none h-full overflow-hidden select-none">
            <SiteRenderer data={page} />
          </div>
        </ScaleToFit>
      </div>
      {/* Floats over the bottom-right corner so it takes no room of its own: every header keeps its
          logo top-left and its menu top-right, and hero text sits on the left. */}
      {label && (
        <div className="pointer-events-none absolute right-3 bottom-3 max-w-[calc(100%-1.5rem)]">
          <Pill tone="brand" icon={<Eye variant="Outline" aria-hidden />}>
            {compactLabel ? (
              <>
                <span aria-hidden className="sm:hidden">
                  {compactLabel}
                </span>
                <span className="max-sm:sr-only">{label}</span>
              </>
            ) : (
              label
            )}
          </Pill>
        </div>
      )}
    </div>
  );
}
