"use client";

import type { ReactNode } from "react";
import { Danger } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  /** Called with `false` when the user cancels or presses Escape. */
  onOpenChange?: (open: boolean) => void;
  /** Same as `onOpenChange(false)`; either one is enough. */
  onClose?: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  icon?: ReactNode;
  /** Keeps the dialog open with a spinner while the action runs. */
  pending?: boolean;
  /** Same as `pending`. */
  loading?: boolean;
  /** `danger` (default) for destructive actions; `primary` / `brand` for a neutral "Continue?" question. */
  tone?: "danger" | "primary" | "brand";
};

/**
 * Small "Are you sure?" popup (Figma "Suspend website (confirm)"): icon tile, title, explanation,
 * Cancel + confirm. Stays open while `pending` so the user sees the action finish.
 *
 * @example
 * <ConfirmDialog
 *   open={open} onOpenChange={setOpen} pending={pending}
 *   title="Suspend this user?" confirmLabel="Suspend user"
 *   description="They can't sign in until you reactivate them."
 *   onConfirm={() => startTransition(async () => { … })}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  icon,
  pending,
  loading,
  tone = "danger",
}: ConfirmDialogProps) {
  const busy = pending ?? loading ?? false;
  const danger = tone === "danger";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange?.(next);
        if (!next) onClose?.();
      }}
    >
      <DialogContent showClose={false} className="max-w-[380px] rounded-[20px] p-[22px]">
        <span
          aria-hidden
          className={cn(
            "mb-3 grid size-10 place-items-center rounded-xl [&_svg]:size-5",
            danger ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand",
          )}
        >
          {icon ?? <Danger />}
        </span>
        <DialogTitle className="text-[17px] font-semibold text-foreground">{title}</DialogTitle>
        <DialogDescription className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
          {description}
        </DialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="text-foreground-soft shadow-button" disabled={busy}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant={danger ? "danger" : "primary"} size="sm" loading={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
