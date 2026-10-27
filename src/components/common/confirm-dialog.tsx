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
import { Modal } from "./modal";

type Shared = {
  open: boolean;
  onConfirm: () => void;
  title: string;
  confirmLabel: string;
};

/** Admin style: controlled Radix dialog (`onOpenChange`, `pending`). */
type RadixConfirmProps = Shared & {
  onOpenChange: (open: boolean) => void;
  description: ReactNode;
  pending?: boolean;
  tone?: "danger" | "primary";
  icon?: ReactNode;
  onClose?: never;
};

/** User and owner portal style: native `<dialog>` (`onClose`, `loading`). */
type NativeConfirmProps = Shared & {
  onClose: () => void;
  description: string;
  icon: ReactNode;
  loading?: boolean;
  /** `danger` (default) for destructive actions, `brand` for a neutral "Continue?" question. */
  tone?: "danger" | "brand";
  onOpenChange?: never;
};

/**
 * Small "Are you sure?" popup (Figma "Suspend website (confirm)"): icon tile, title, explanation,
 * Cancel + confirm. Two call styles, like `Modal`: `onOpenChange` (Admin) or `onClose` (user/owner portals).
 *
 * @example
 * <ConfirmDialog
 *   open={open} onOpenChange={setOpen} tone="danger" pending={pending}
 *   title="Suspend this user?" confirmLabel="Suspend user"
 *   description="They can't sign in until you reactivate them."
 *   onConfirm={() => startTransition(async () => { … })}
 * />
 */
export function ConfirmDialog(props: RadixConfirmProps | NativeConfirmProps) {
  return props.onClose !== undefined ? <NativeConfirm {...props} /> : <RadixConfirm {...props} />;
}

function RadixConfirm({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
  tone = "danger",
  icon,
}: RadixConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent showClose={false} className="max-w-[380px] rounded-[20px] p-[22px]">
        <span
          aria-hidden
          className={cn(
            "mb-3 grid size-10 place-items-center rounded-xl [&_svg]:size-5",
            tone === "danger" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand",
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
            <Button variant="ghost" size="sm" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant={tone === "danger" ? "danger" : "primary"} size="sm" loading={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NativeConfirm({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  icon,
  loading,
  tone = "danger",
}: NativeConfirmProps) {
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
