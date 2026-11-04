"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Add, Export } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { checkImage, type ImageRule } from "@/lib/image-rules";
import { cn } from "@/lib/utils";
import { Modal } from "./modal";

type UploadImageModalProps = {
  open: boolean;
  onClose: () => void;
  rule: ImageRule;
  /** Return `true` when the upload worked; the modal then closes. */
  onUpload: (file: File) => Promise<boolean>;
  /** Show a circular, adjustable crop before uploading (used for profile photos and logos). */
  cropCircle?: boolean;
  /** Optional initial file to immediately preview/crop when opening. */
  initialFile?: File | null;
};

const CROP_SIZE = 300;

/** "Upload an image" popup with drag and drop and a file picker. */
export function UploadImageModal({
  open,
  onClose,
  rule,
  onUpload,
  cropCircle = false,
  initialFile = null,
}: UploadImageModalProps) {
  const formKey = initialFile ? `${initialFile.name}-${initialFile.lastModified}` : (open ? "open" : "closed");
  return (
    <Modal open={open} onClose={onClose} label="Upload an image" className="max-w-[420px] rounded-[18px] border border-border shadow-dialog">
      <UploadForm key={formKey} rule={rule} onClose={onClose} onUpload={onUpload} cropCircle={cropCircle} initialFile={initialFile} />
    </Modal>
  );
}

function UploadForm({
  rule,
  onClose,
  onUpload,
  cropCircle = false,
  initialFile = null,
}: Pick<UploadImageModalProps, "rule" | "onClose" | "onUpload" | "cropCircle" | "initialFile">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropStageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  const initialProblem = initialFile ? checkImage(initialFile, rule) : null;
  const [file, setFile] = useState<File | null>(initialProblem ? null : initialFile);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [cropSize, setCropSize] = useState(CROP_SIZE);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(initialProblem);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // A temporary local URL so the chosen image can be shown before it is uploaded.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    const stage = cropStageRef.current;
    if (!stage || !cropCircle) return;
    const observer = new ResizeObserver(([entry]) => setCropSize(entry.contentRect.width));
    observer.observe(stage);
    return () => observer.disconnect();
  }, [cropCircle, file]);

  function choose(next: File | undefined) {
    if (!next) return;
    const problem = checkImage(next, rule);
    setError(problem);
    setFile(problem ? null : next);
    setImageSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const baseScale = imageSize ? Math.max(cropSize / imageSize.width, cropSize / imageSize.height) : 1;
  const renderedWidth = imageSize ? imageSize.width * baseScale * zoom : cropSize;
  const renderedHeight = imageSize ? imageSize.height * baseScale * zoom : cropSize;

  function clampOffset(next: { x: number; y: number }, nextZoom = zoom) {
    if (!imageSize) return { x: 0, y: 0 };
    const scale = Math.max(cropSize / imageSize.width, cropSize / imageSize.height) * nextZoom;
    const maxX = Math.max(0, (imageSize.width * scale - cropSize) / 2);
    const maxY = Math.max(0, (imageSize.height * scale - cropSize) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  function startCropDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!imageSize) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, ...offset };
  }

  function moveCropDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    setOffset(clampOffset({
      x: dragRef.current.x + event.clientX - dragRef.current.pointerX,
      y: dragRef.current.y + event.clientY - dragRef.current.pointerY,
    }));
  }

  async function getUploadFile(): Promise<File> {
    if (!cropCircle || !file || !previewUrl || !imageSize) return file!;
    const image = new window.Image();
    image.src = previewUrl;
    await image.decode();

    const scale = Math.max(cropSize / image.naturalWidth, cropSize / image.naturalHeight) * zoom;
    const cropWidth = cropSize / scale;
    const sourceX = (image.naturalWidth - cropWidth) / 2 - offset.x / scale;
    const sourceY = (image.naturalHeight - cropWidth) / 2 - offset.y / scale;

    // Output at high resolution (at least 1024px, up to 2048px) so zoomed crops remain sharp on Retina displays
    const outputSize = Math.min(2048, Math.max(1024, Math.round(cropWidth)));
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the cropped photo.");

    // Enable high-quality bicubic resampling for clear, non-blurry output
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      image,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(image.naturalWidth - Math.max(0, sourceX), cropWidth),
      Math.min(image.naturalHeight - Math.max(0, sourceY), cropWidth),
      0,
      0,
      outputSize,
      outputSize,
    );

    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const mimeType = isPng ? "image/png" : "image/jpeg";
    const quality = isPng ? undefined : 0.96;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Could not prepare the cropped photo."))),
        mimeType,
        quality,
      );
    });

    const ext = isPng ? "png" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}-cropped.${ext}`, { type: mimeType, lastModified: Date.now() });
  }

  async function submit() {
    if (!file) return;
    setUploading(true);
    try {
      const ok = await onUpload(await getUploadFile());
      if (ok) onClose();
    } catch {
      setError("Could not prepare this photo. Please choose it again and retry.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between pt-3.5 pr-4 pb-2.5 pl-4">
        <h2 className="font-sans text-sm leading-[21px] font-bold">Upload an image</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-[18px] items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Add variant="Outline" aria-hidden className="size-[18px] rotate-45" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div
          role={!cropCircle || !file ? "button" : undefined}
          tabIndex={!cropCircle || !file ? 0 : undefined}
          aria-label={!cropCircle || !file ? "Choose an image: click or drop a file here" : undefined}
          onClick={() => {
            if (!cropCircle || !file) inputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if ((!cropCircle || !file) && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            choose(event.dataTransfer.files[0]);
          }}
          className={cn(
            "group flex flex-col items-center gap-2 rounded-[14px] border border-dashed text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
            (!cropCircle || !file) && "cursor-pointer hover:border-primary hover:bg-brand-soft",
            file ? "bg-background p-3 hover:bg-background" : "p-[26px]",
            dragging ? "border-primary bg-brand-soft" : file ? "border-dropzone-border" : "border-dropzone-border bg-primary-soft",
          )}
        >
          {file && previewUrl && cropCircle ? (
            <>
              <div
                role="img"
                aria-label="Circular photo crop preview. Drag the photo to reposition it."
                onClick={(event) => event.stopPropagation()}
                onPointerDown={startCropDrag}
                onPointerMove={moveCropDrag}
                onPointerUp={(event) => {
                  event.stopPropagation();
                  dragRef.current = null;
                }}
                onPointerCancel={() => { dragRef.current = null; }}
                ref={cropStageRef}
                className="relative aspect-square w-full max-w-[300px] touch-none cursor-grab overflow-hidden rounded-full bg-slate-200 active:cursor-grabbing isolate [transform:translateZ(0)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt=""
                  draggable={false}
                  onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                  className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges]"
                  style={{
                    width: `${Math.round(renderedWidth)}px`,
                    height: `${Math.round(renderedHeight)}px`,
                    transform: `translate3d(calc(-50% + ${Math.round(offset.x)}px), calc(-50% + ${Math.round(offset.y)}px), 0)`,
                    willChange: "transform",
                  }}
                />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-inset ring-primary/30" />
              </div>
              <div className="flex w-full items-center gap-3 px-1" onClick={(event) => event.stopPropagation()}>
                <label htmlFor="profile-photo-zoom" className="shrink-0 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Zoom</label>
                <input
                  id="profile-photo-zoom"
                  aria-label="Zoom photo crop"
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(event) => {
                    const nextZoom = Number(event.target.value);
                    setZoom(nextZoom);
                    setOffset((current) => clampOffset(current, nextZoom));
                  }}
                  style={{ "--crop-progress": `${((zoom - 1) / 2) * 100}%` } as CSSProperties}
                  className="profile-crop-zoom min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground-soft transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-brand-deep focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  Change photo
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Drag the photo to adjust the crop.</p>
            </>
          ) : file && previewUrl ? (
            // The whole image, at its own proportions (no name or size text). Click or drop to replace it.
            <Image
              src={previewUrl}
              alt={`Preview of ${file.name}`}
              width={0}
              height={0}
              unoptimized
              sizes="380px"
              className="h-auto max-h-[300px] w-auto max-w-full rounded-[8px] object-contain"
            />
          ) : (
            <>
              <span aria-hidden className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Export variant="Outline" className="size-[19px]" />
              </span>
              <p className="text-[13px] leading-[19.5px] font-bold">Drag a photo here</p>
              <p className="text-xs leading-[18px] text-hint-strong">
                or{" "}
                <span className="font-semibold text-primary underline-offset-2 group-hover:underline">
                  browse your files
                </span>{" "}
                · {rule.label}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={rule.types.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose an image file"
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              choose(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </div>

        {error && (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-foreground-soft" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button size="sm" className="shadow-upload" onClick={submit} disabled={!file} loading={uploading}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
