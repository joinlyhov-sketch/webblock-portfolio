"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Add, ArrowLeft, Devices, Lock1, Mobile, Monitor } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Template, TemplatePreviewImage } from "@/types/template";
import { BusinessInfoModal } from "./business-info-modal";

type Device = "desktop" | "tablet" | "mobile";

const devices: { id: Device; label: string; icon: React.ReactNode }[] = [
  { id: "desktop", label: "Desktop", icon: <Monitor /> },
  { id: "tablet", label: "Tablet", icon: <Devices /> },
  { id: "mobile", label: "Mobile", icon: <Mobile /> },
];

/** Decorative dots on the desktop canvas (Figma "Preview decor"). */
const softDots = [
  { file: "ea3a0", size: 14, left: 120, top: 260 },
  { file: "b09ea", size: 10, left: 205, top: 520 },
  { file: "fe292", size: 16, left: 90, top: 760 },
  { file: "99712", size: 12, left: 1560, top: 140 },
  { file: "8b01d", size: 16, left: 1640, top: 420 },
  { file: "e69bd", size: 10, left: 1540, top: 640 },
  { file: "7a23f", size: 12, left: 1660, top: 860 },
  { file: "1568c", size: 10, left: 180, top: 920 },
];

const scrollArea =
  "overflow-x-clip overflow-y-auto [scrollbar-color:var(--color-scroll-thumb)_var(--color-scroll-track)] [scrollbar-width:thin]";

const chip =
  "items-center gap-2 rounded-full bg-background py-2 pr-3.5 pl-3 text-[13px] font-semibold text-foreground shadow-[0_12px_28px_rgb(27_43_75/0.08),0_2px_6px_rgb(27_43_75/0.05)]";

/** The scrollable full-page capture of the template site. */
function FullPage({ image, alt }: { image: TemplatePreviewImage; alt: string }) {
  return (
    <Image
      src={image.url}
      alt={alt}
      width={image.width}
      height={image.height}
      unoptimized
      draggable={false}
      className="block h-auto w-full max-w-none"
    />
  );
}

function MonitorFrame({ image, alt }: { image: TemplatePreviewImage; alt: string }) {
  return (
    <div className="flex w-full max-w-[1317.6px] flex-col items-center">
      <div className="flex w-full flex-col overflow-clip rounded-[23.187px] bg-device-monitor px-[13.377px] pt-[13.377px] shadow-[0_23.187px_46.374px_rgb(60_120_207/0.18)]">
        <div className={cn("aspect-[1290.838/768.077] w-full rounded-[5.797px] bg-background", scrollArea)}>
          <FullPage image={image} alt={alt} />
        </div>
        <div className="flex h-[43.476px] w-full shrink-0 items-center justify-center bg-device-chin">
          <Image src="/images/preview/monitor-logo.svg" alt="" width={9} height={9} unoptimized />
        </div>
      </div>
      <div className="h-[43.476px] w-[130.428px] bg-linear-to-r from-device-stand via-device-chin to-device-stand" />
      <div className="h-[11.594px] w-[289.84px] rounded-[5.797px] bg-device-stand" />
    </div>
  );
}

function TabletFrame({ image, alt }: { image: TemplatePreviewImage; alt: string }) {
  const key =
    "absolute -right-[14px] h-[57.895px] w-[5.789px] rounded-[2.316px] bg-linear-to-r from-device-key-tablet via-device-key-tablet-mid to-device-key-tablet";
  return (
    <div className="relative flex w-[662.316px] max-w-full flex-col rounded-[48.632px] border-[4.632px] border-device-tablet-edge bg-device-phone p-[18.526px] shadow-[0_6.947px_8.105px_rgb(60_120_207/0.07),0_34.737px_34.737px_rgb(60_120_207/0.18)]">
      <div className={cn("relative h-[842.947px] w-full rounded-[25.474px] bg-background", scrollArea)}>
        <FullPage image={image} alt={alt} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10px] left-1/2 h-[5.789px] w-[173.684px] -translate-x-1/2 rounded-[3.474px] bg-device-phone/85"
      />
      <Image
        src="/images/preview/tablet-camera.svg"
        alt=""
        width={8}
        height={8}
        unoptimized
        className="absolute top-[5.21px] left-1/2 -translate-x-1/2"
      />
      <span
        aria-hidden
        className="absolute -top-[9.26px] right-[41px] h-[5.789px] w-[69.474px] rounded-[2.316px] bg-linear-to-b from-device-key-tablet via-device-key-tablet-mid to-device-key-tablet"
      />
      <span aria-hidden className={cn(key, "top-[111.16px]")} />
      <span aria-hidden className={cn(key, "top-[180.63px]")} />
    </div>
  );
}

function PhoneFrame({ image, alt }: { image: TemplatePreviewImage; alt: string }) {
  const key =
    "absolute w-[5.473px] rounded-[2.189px] bg-linear-to-r from-device-key via-device-key-mid to-device-key";
  return (
    <div className="relative flex w-[426.866px] max-w-full flex-col rounded-[62.607px] border-[4.378px] border-device-phone-edge bg-device-phone p-[13.134px] shadow-[0_6.567px_7.662px_rgb(60_120_207/0.08),0_32.836px_32.836px_rgb(60_120_207/0.2)]">
      <div className={cn("relative h-[853.731px] w-full rounded-[49.801px] bg-background", scrollArea)}>
        <div className="sticky top-0 z-10 -mb-[54.726px] h-[54.726px] w-full bg-background">
          <span className="absolute top-[18.28px] left-[45.97px] font-[Inter,sans-serif] text-[16.418px] font-semibold text-device-phone">
            9:41
          </span>
          <Image
            src="/images/preview/status-icons.svg"
            alt=""
            width={79}
            height={14}
            unoptimized
            className="absolute top-[21.02px] left-[291.14px]"
          />
        </div>
        <div className="pt-[56.92px]">
          <FullPage image={image} alt={alt} />
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8px] left-1/2 h-[5.473px] w-[146.667px] -translate-x-1/2 rounded-[3.284px] bg-device-phone/85"
      />
      <Image
        src="/images/preview/dynamic-island.svg"
        alt=""
        width={120}
        height={31}
        unoptimized
        className="absolute top-[25.61px] left-1/2 -translate-x-1/2"
      />
      <span aria-hidden className={cn(key, "-left-[8.76px] top-[164.18px] h-[32.836px]")} />
      <span aria-hidden className={cn(key, "-left-[8.76px] top-[223.29px] h-[63.483px]")} />
      <span aria-hidden className={cn(key, "-left-[8.76px] top-[299.9px] h-[63.483px]")} />
      <span aria-hidden className={cn(key, "-right-[14px] top-[258.31px] h-[100.697px]")} />
    </div>
  );
}

/** Full-screen template preview with a Desktop / Tablet / Mobile switch and "Use template". */
export function TemplatePreviewer({
  template,
  businessTypes,
}: {
  template: Template;
  businessTypes: string[];
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [using, setUsing] = useState(false);
  const active = devices.find((d) => d.id === device)!;
  const alt = `${template.name} template, ${active.label.toLowerCase()} size`;
  const image = template.previews[device];

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-b from-page-from via-page-via via-60% to-page">
      <header className="flex h-[72px] shrink-0 items-center gap-6 border-b border-border bg-background px-8">
        <div className="flex min-w-px flex-1 items-center gap-4 overflow-clip">
          <Link
            href="/templates"
            className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[13px] leading-[19.5px] font-semibold whitespace-nowrap text-foreground-soft shadow-button outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ArrowLeft aria-hidden className="size-[15px]" /> Back to templates
          </Link>
          <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <h1 className="font-heading text-[17px] font-semibold text-foreground">{template.name}</h1>
            {template.badge ? <span className="text-xs font-semibold text-primary">{template.badge}</span> : null}
          </div>
        </div>

        <div
          role="group"
          aria-label="Preview size"
          className="flex w-[397px] shrink-0 items-start gap-1 rounded-xl bg-switcher p-1"
        >
          {devices.map((d) => {
            const on = d.id === device;
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={on}
                onClick={() => setDevice(d.id)}
                className={cn(
                  "flex h-9 min-w-px flex-1 items-center justify-center gap-1.5 rounded-[9px] px-[18px] text-sm leading-[21px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-[14px]",
                  on
                    ? "bg-background font-semibold text-brand-deep shadow-[0_4px_5px_rgb(60_120_207/0.08),0_1px_1.5px_rgb(60_120_207/0.08)]"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {d.icon}
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-px flex-1 items-center justify-end overflow-clip">
          <Button size="sm" onClick={() => setUsing(true)}>
            <Add aria-hidden /> Use template
          </Button>
        </div>
      </header>

      {device === "desktop" ? (
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-x-clip overflow-y-auto bg-page px-12 py-8">
          <div aria-hidden className="bg-dots pointer-events-none absolute inset-0" />
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
            {softDots.map((d) => (
              <Image
                key={d.file}
                src={`/images/preview/dot-${d.file}.svg`}
                alt=""
                width={d.size}
                height={d.size}
                unoptimized
                style={{ left: d.left, top: d.top }}
                className="absolute"
              />
            ))}
          </div>
          <p className={cn(chip, "absolute top-[120px] left-7 hidden xl:inline-flex")}>
            <span aria-hidden className="size-2.5 rounded-full bg-primary shadow-[0_0_0_3px_rgb(67_121_214/0.35)]" />
            Template preview
          </p>
          <div className="relative flex w-full flex-1 items-center justify-center">
            <MonitorFrame image={image} alt={alt} />
          </div>
          <p className={cn(chip, "absolute bottom-6 left-1/2 inline-flex -translate-x-1/2")}>
            <Lock1 aria-hidden className="size-[14px]" />
            yourbusiness.webblock.com
          </p>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center overflow-x-clip overflow-y-auto bg-background px-4 py-8">
          {device === "tablet" ? <TabletFrame image={image} alt={alt} /> : <PhoneFrame image={image} alt={alt} />}
        </div>
      )}

      <BusinessInfoModal
        template={using ? template : null}
        businessTypes={businessTypes}
        onClose={() => setUsing(false)}
      />
    </div>
  );
}
