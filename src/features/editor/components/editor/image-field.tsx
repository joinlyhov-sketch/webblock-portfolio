"use client";

import { useState } from "react";
import Image from "next/image";
import { Export, Gallery, GalleryEdit, Trash } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { UploadImageModal } from "@/components/common/upload-image-modal";
import { Button } from "@/components/ui/button";
import { SITE_IMAGE_RULE } from "@/lib/image-rules";
import { cn } from "@/lib/utils";
import { uploadMediaAction } from "../../actions";
import { useMedia } from "./editor-context";

/**
 * Figma "Content · Image": thumbnail + file name, "Replace image" (pick from the library),
 * "Upload" (a file from the owner's computer) and remove.
 * Used as a Puck custom field, so it also works inside product rows.
 */
export function ImageField({
  id,
  value,
  onChange,
  readOnly,
}: {
  id: string;
  value: string | null;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
}) {
  const { websiteId, media, addMedia } = useMedia();
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Uploaded images live at /api/mock-media/<id>, so show the original file name from the library.
  const name = media.find((asset) => asset.url === value)?.name ?? value?.split("/").pop() ?? "No image";

  async function upload(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.set("image", file);
    const result = await uploadMediaAction(websiteId, formData);
    if (!result.ok) {
      toast.error("Couldn't upload image", result.message);
      return false;
    }
    addMedia(result.data);
    onChange(result.data.url);
    setPicking(false);
    return true;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-[84px] shrink-0 overflow-hidden rounded-xl bg-primary-soft">
          {value ? (
            <Image src={value} alt="" fill sizes="84px" className="object-cover" />
          ) : (
            <Gallery aria-hidden className="absolute inset-0 m-auto size-6 text-placeholder" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{value ? "Shown at 4:3" : "A placeholder is shown"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          disabled={readOnly}
          aria-expanded={picking}
          aria-controls={`${id}-library`}
          onClick={() => setPicking((open) => !open)}
        >
          <GalleryEdit /> Replace image
        </Button>
        <Button variant="secondary" size="sm" disabled={readOnly} onClick={() => setUploading(true)}>
          <Export /> Upload
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Remove image"
          disabled={readOnly || !value}
          onClick={() => onChange(null)}
        >
          <Trash />
        </Button>
      </div>

      {picking && (
        <div
          id={`${id}-library`}
          role="listbox"
          aria-label="Image library"
          className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-border bg-muted p-2"
        >
          {media.map((asset) => (
            <button
              key={asset.id}
              type="button"
              role="option"
              aria-selected={asset.url === value}
              aria-label={asset.name}
              onClick={() => {
                onChange(asset.url);
                setPicking(false);
              }}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                asset.url === value ? "border-brand" : "border-transparent hover:border-primary/40",
              )}
            >
              <Image src={asset.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <UploadImageModal open={uploading} onClose={() => setUploading(false)} rule={SITE_IMAGE_RULE} onUpload={upload} />
    </div>
  );
}
