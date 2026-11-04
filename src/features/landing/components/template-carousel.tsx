"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft2, ArrowRight2, Lock1, Maximize4 } from "iconsax-reactjs";
import type { Carousel3DItem } from "@/components/common/carousel-3d";
import { useInView } from "@/components/common/motion";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrowserMock, showcaseTemplates } from "./template-mock";

const stageClass = "h-[300px] w-full sm:h-[400px] md:h-[480px] lg:h-[560px]";
const floatStyle = { "--float-y": "8px", "--float-duration": "6s", "--float-delay": "-1.5s" } as CSSProperties;

// WebGL only exists in the browser, so the three.js carousel loads on the client.
const Carousel3D = dynamic(() => import("@/components/common/carousel-3d").then((m) => m.Carousel3D), {
  ssr: false,
  loading: () => <div aria-hidden className={stageClass} />,
});

/**
 * Optimised copies for the 3D cards (the originals are 2560px): 1080px covers the front card on
 * phones and most laptops, 1920px large desktops. Asking for half the width makes its "2x" `src`
 * exactly that width; quality 90 keeps the screenshot text crisp, as on the other mocks.
 */
const TEXTURE_WIDTHS = [1080, 1920];

const items: Carousel3DItem[] = showcaseTemplates.map((template) => ({
  id: template.slug,
  label: template.name,
  imageSrc: template.image.src,
  aspect: template.image.width / template.image.height,
  sources: TEXTURE_WIDTHS.map((width) => ({
    width,
    src: getImageProps({
      src: template.image.src,
      alt: "",
      width: width / 2,
      height: Math.round((width / 2) * (template.image.height / template.image.width)),
      quality: 90,
    }).props.src,
  })),
}));

/** Plates starts in the middle of the fan. */
const START = showcaseTemplates.findIndex((template) => template.slug === "plates");

/**
 * The templates as a 3D ring. Clicking a card (or dragging) turns it to the front.
 * Clicking the active card opens a high-resolution full-screen preview lightbox so every detail is razor sharp.
 */
export function TemplateCarousel() {
  const [active, setActive] = useState(START);
  const [previewOpen, setPreviewOpen] = useState(false);
  const current = showcaseTemplates[active];
  const count = showcaseTemplates.length;

  const handlePrev = useCallback(() => {
    setActive((i) => (i - 1 + count) % count);
  }, [count]);

  const handleNext = useCallback(() => {
    setActive((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen, handlePrev, handleNext]);

  // three.js (~140 KB gzipped) and its WebGL setup wait until the section is about to scroll in,
  // so they stay off the main thread while the page first loads.
  const stageRef = useRef<HTMLDivElement>(null);
  const nearView = useInView(stageRef, { once: true, margin: "100px 0px" });

  return (
    <div className="flex w-full flex-col items-center gap-4 md:gap-6">
      {nearView ? (
        <div className={cn(stageClass, "motion-safe:animate-landing-float")} style={floatStyle}>
          <Carousel3D
            items={items}
            activeIndex={active}
            onSelect={setActive}
            onActiveCardClick={() => setPreviewOpen(true)}
            className="size-full cursor-grab active:cursor-grabbing"
            fallback={
              <div className="mx-auto w-full max-w-[720px]">
                <BrowserMock template={current} />
              </div>
            }
          />
        </div>
      ) : (
        <div ref={stageRef} aria-hidden className={stageClass} />
      )}

      {/* Subtle, accessible prompt to inspect the active template in full clarity */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-md transition-all hover:border-brand/40 hover:bg-background hover:text-foreground hover:shadow-md cursor-pointer"
        aria-label={`Zoom and preview ${current.name} template in full resolution`}
      >
        <Maximize4 variant="Outline" className="size-3.5 text-brand transition-transform group-hover:scale-110" />
        <span>
          Click card or tap to zoom <strong className="font-semibold text-foreground">{current.name}</strong> ({active + 1}/{count})
        </span>
      </button>

      {/* Full-size high-resolution template preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-h-[94dvh] w-[calc(100vw-24px)] max-w-5xl rounded-[20px] p-0 border border-border shadow-2xl bg-background flex flex-col overflow-hidden"
          showClose={true}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-5 py-3.5 pr-16 sm:px-6 sm:pr-20">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-base font-semibold text-foreground">
                {current.name}
              </DialogTitle>
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong">
                {current.style}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {active + 1} of {count}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md text-foreground hover:bg-muted"
                  onClick={handlePrev}
                  aria-label="Previous template"
                >
                  <ArrowLeft2 variant="Outline" className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md text-foreground hover:bg-muted"
                  onClick={handleNext}
                  aria-label="Next template"
                >
                  <ArrowRight2 variant="Outline" className="size-3.5" />
                </Button>
              </div>

              <Button asChild size="sm" variant="primary" className="h-8 text-xs">
                <Link href="/templates">Use template</Link>
              </Button>
            </div>
          </div>

          <DialogDescription className="sr-only">
            Full-resolution preview of the {current.name} template
          </DialogDescription>

          {/* Body with full-resolution browser window */}
          <div className="flex-1 overflow-y-auto bg-muted/40 p-3 sm:p-6">
            <div className="mx-auto flex max-w-[940px] flex-col overflow-hidden rounded-[14px] border border-border bg-background shadow-xl">
              {/* Browser chrome top bar */}
              <div className="flex h-10 items-center justify-between border-b border-border bg-muted/30 px-4">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-window-close" />
                  <span className="size-2.5 rounded-full bg-window-minimize" />
                  <span className="size-2.5 rounded-full bg-window-zoom" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground shadow-xs">
                  <Lock1 variant="Outline" className="size-3 text-muted-foreground" />
                  <span className="font-mono text-[11px] text-foreground">{current.domain}</span>
                </div>
                <div className="w-12 hidden sm:block" aria-hidden="true" />
              </div>

              {/* Master WebP image at native crispness */}
              <div className="relative w-full aspect-2560/1584 bg-background overflow-hidden">
                <Image
                  src={current.image.src}
                  alt={`${current.name} template site preview`}
                  width={current.image.width}
                  height={current.image.height}
                  quality={95}
                  priority
                  className="size-full object-contain"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
