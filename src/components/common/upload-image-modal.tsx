"use client";

import { useRef, useState } from "react";
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
};

/** "Upload an image" popup with drag and drop and a file picker. */
export function UploadImageModal({ open, onClose, rule, onUpload }: UploadImageModalProps) {
  return (
    <Modal open={open} onClose={onClose} label="Upload an image" className="max-w-[420px] rounded-[18px] border border-border shadow-dialog">
      <UploadForm rule={rule} onClose={onClose} onUpload={onUpload} />
    </Modal>
  );
}

function UploadForm({ rule, onClose, onUpload }: Pick<UploadImageModalProps, "rule" | "onClose" | "onUpload">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  function choose(next: File | undefined) {
    if (!next) return;
    const problem = checkImage(next, rule);
    setError(problem);
    setFile(problem ? null : next);
  }

  async function submit() {
    if (!file) return;
    setUploading(true);
    const ok = await onUpload(file);
    setUploading(false);
    if (ok) onClose();
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
          <Add aria-hidden className="size-[18px] rotate-45" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div
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
            "flex flex-col items-center gap-2 rounded-[14px] border border-dashed p-[26px] text-center transition-colors",
            dragging ? "border-primary bg-brand-soft" : "border-dropzone bg-primary-soft",
          )}
        >
          <span aria-hidden className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Export className="size-[19px]" />
          </span>
          {file ? (
            <>
              <p className="max-w-full truncate text-[13px] leading-[19.5px] font-bold">{file.name}</p>
              <p className="text-xs leading-[18px] text-hint-strong">
                {(file.size / 1024).toFixed(0)} KB · ready to upload
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-[19.5px] font-bold">Drag a photo here</p>
              <p className="text-xs leading-[18px] text-hint-strong">
                or{" "}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="font-semibold text-primary hover:underline focus-visible:underline"
                >
                  browse your files
                </button>{" "}
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
            onChange={(event) => choose(event.target.files?.[0])}
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
