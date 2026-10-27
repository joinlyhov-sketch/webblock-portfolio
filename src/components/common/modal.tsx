"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PortalContainerContext } from "@/components/ui/portal-container";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  children: ReactNode;
  /** Width and other layout classes, e.g. "max-w-lg". */
  className?: string;
};

/**
 * Centered dialog on the native `<dialog>` element: focus trap, Escape and the blurred backdrop
 * come from the browser. Children mount only while open, so forms reset every time.
 */
export function Modal({ open, onClose, label, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Dropdowns inside the modal portal into the <dialog>; in <body> they would sit under its top layer.
  const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);
  // `close` events caused by `open` turning false are not the user closing the dialog.
  const closedByProp = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      closedByProp.current = true;
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        setDialogEl(el);
      }}
      aria-label={label}
      onClose={() => {
        if (closedByProp.current) closedByProp.current = false;
        else onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-[18px] border border-border bg-background p-0 text-foreground shadow-dialog",
        "backdrop:bg-scrim backdrop:backdrop-blur-[7px] open:animate-modal-in",
        className,
      )}
    >
      <PortalContainerContext value={dialogEl}>{open && children}</PortalContainerContext>
    </dialog>
  );
}
