"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} label={title} className="max-w-[380px]">
      <div className="flex flex-col items-start gap-3 p-[22px]">
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-xl bg-danger-soft text-danger [&_svg]:size-[19px]"
        >
          {icon}
        </span>
        <div className="w-full">
          <h2 className="font-sans text-base leading-6 font-bold text-foreground">{title}</h2>
          <p className="pt-1 text-[13px] leading-[19.5px] text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-foreground-soft shadow-button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
