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

/**
 * Small "Are you sure?" popup (Figma "Suspend website (confirm)"): icon tile, title, explanation,
 * Cancel + confirm. Stays open while `pending` so the user sees the action finish.
 *
 * @example
 * <ConfirmDialog
 *   open={open} onOpenChange={setOpen} tone="danger" pending={pending}
 *   title="Suspend this user?" confirmLabel="Suspend user"
 *   description="They can't sign in until you reactivate them."
 *   onConfirm={() => startTransition(async () => { … })}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
  tone = "danger",
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  tone?: "danger" | "primary";
  icon?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        showClose={false}
        className="max-w-[380px] rounded-[20px] p-[22px]"
      >
        <span
          aria-hidden
          className={cn(
            "mb-3 grid size-10 place-items-center rounded-xl [&_svg]:size-5",
            tone === "danger"
              ? "bg-danger-soft text-danger"
              : "bg-brand-soft text-brand",
          )}
        >
          {icon ?? <Danger />}
        </span>
        <DialogTitle className="text-[17px] font-semibold text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
          {description}
        </DialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            loading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
