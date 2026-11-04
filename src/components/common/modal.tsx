"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[600px]",
  xl: "max-w-[680px]",
} as const;

/** Bare popup: the content draws its own heading and close button (app screens). */
type BareModalProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  children: ReactNode;
  /** Width and other layout classes, e.g. "max-w-lg". */
  className?: string;
};

/** Titled popup: heading, ✕ and an optional footer are built in (admin screens). */
type TitledModalProps = {
  /** Accessible name. Shown as the heading unless `hideTitle` (when the body has its own heading). */
  title: string;
  description?: string;
  hideTitle?: boolean;
  size?: keyof typeof SIZE;
  /** "right" = a full-height panel on the right (e.g. Publish flow). */
  side?: "center" | "right";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
} & (
  | {
      /** URL-driven popup: always open, closing navigates here (e.g. the list without `?user=`). */
      closeHref: string;
      open?: never;
      onOpenChange?: never;
    }
  | { closeHref?: never; open: boolean; onOpenChange: (open: boolean) => void }
);

type ModalProps = BareModalProps | TitledModalProps;

/**
 * Every popup (Figma "Plan details dialog" style): centered card, blurred backdrop.
 * Two forms, chosen by the props:
 * - `open` + `onClose` + `label`: bare card, the children draw their own heading and close button.
 * - `title` (+ `closeHref`, or `open` + `onOpenChange`): heading, ✕ and `footer` built in.
 *   Admin row details are URL-driven (`closeHref`), so a detail can be linked to and Back closes it.
 *
 * @example
 * <Modal open={open} onClose={() => setOpen(false)} label="Edit product">…</Modal>
 * {userId && <Modal title={user.fullName} hideTitle closeHref={tableHref(searchParams, { user: null })}>…</Modal>}
 */
export function Modal(props: ModalProps) {
  return "label" in props ? <BareModal {...props} /> : <TitledModal {...props} />;
}

/**
 * Bare card using Radix Dialog: focus trap, Escape, blurred backdrop, and proper z-index.
 * Children mount while open and stay through the exit animation, then unmount, so forms reset every time.
 */
function BareModal({ open, onClose, label, children, className }: BareModalProps) {
  // Callers often render `{open && <Form />}`, so their children vanish the moment `open` turns false.
  // Keep showing the last open content during the exit fade, or the card collapses to a thin line.
  const [exitChildren, setExitChildren] = useState(children);
  if (open && exitChildren !== children) setExitChildren(children);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent showClose={false} className={cn("p-0 outline-none", className)}>
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <DialogDescription className="sr-only">{label}</DialogDescription>
        {open ? children : exitChildren}
      </DialogContent>
    </Dialog>
  );
}

function TitledModal({
  title,
  description,
  hideTitle = false,
  size = "md",
  side = "center",
  children,
  footer,
  className,
  closeHref,
  open,
  onOpenChange,
}: TitledModalProps) {
  const router = useRouter();
  const routed = closeHref !== undefined;
  // URL-driven popups close locally first so the exit animation can play, then update the URL.
  const [routedOpen, setRoutedOpen] = useState(true);

  return (
    <Dialog
      open={routed ? routedOpen : open}
      onOpenChange={(next) => {
        if (routed) {
          if (!next) {
            setRoutedOpen(false);
            const duration = side === "right" ? 200 : 150;
            const exitMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
            setTimeout(() => router.push(closeHref, { scroll: false }), exitMs);
          }
        } else {
          onOpenChange?.(next);
        }
      }}
    >
      <DialogContent
        side={side}
        className={cn(
          side === "right"
            ? "w-[calc(100vw-16px)] max-w-[1220px] rounded-l-3xl rounded-r-none md:w-[70vw]"
            : SIZE[size],
          className,
        )}
      >
        <div className={cn("min-h-0 flex-1 overflow-y-auto", !hideTitle && "px-6 pt-6")}>
          <DialogTitle
            className={cn(hideTitle ? "sr-only" : "pr-10 text-[22px] leading-7 font-semibold break-words text-foreground")}
          >
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className={cn(hideTitle ? "sr-only" : "mt-1 text-[13px] text-muted-foreground")}>
              {description}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
          {children}
        </div>
        {footer && // The divider is inset from the card edges, like the section headers.
        <div className="mx-[15px] flex justify-end gap-2.5 border-t border-border px-[9px] py-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
