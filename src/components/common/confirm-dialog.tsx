"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Modal } from "./modal";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  icon: ReactNode;
  loading?: boolean;
  /** `danger` (default) for destructive actions, `brand` for a neutral "Continue?" question. */
  tone?: "danger" | "brand";
};

/** Small "Are you sure?" popup for destructive actions (log out, suspend). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  icon,
  loading,
  tone = "danger",
}: ConfirmDialogProps) {
  const brand = tone === "brand";
  return (
    <Modal open={open} onClose={onClose} label={title} className="max-w-[380px]">
      <div className="flex flex-col items-start gap-3 p-[22px]">
        <span
          aria-hidden
          className={cn(
            "flex size-10 items-center justify-center rounded-xl [&_svg]:size-[19px]",
            brand ? "bg-brand-soft text-brand" : "bg-danger-soft text-danger",
          )}
        >
          {icon}
        </span>
        <div className="w-full">
          <h2
            className={cn(
              "text-foreground",
              brand ? "font-heading text-[17px] leading-6 font-semibold" : "font-sans text-base leading-6 font-bold",
            )}
          >
            {title}
          </h2>
          <p className="pt-1 text-[13px] leading-[19.5px] text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-foreground-soft shadow-button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={brand ? "primary" : "danger"} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
