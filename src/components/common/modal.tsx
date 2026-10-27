"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[600px]",
  xl: "max-w-[680px]",
} as const;

type ModalProps = {
  /** Accessible name. Shown as the heading unless `hideTitle` (when the body has its own heading). */
  title: string;
  description?: string;
  hideTitle?: boolean;
  size?: keyof typeof SIZE;
  /** "right" = a full-height panel sliding in from the right (e.g. Publish flow). */
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

/**
 * Every popup (Figma "Plan details dialog" style): centered card, blurred backdrop, ✕ top right,
 * scrolls inside when taller than the screen. Admin row details are URL-driven (`closeHref`),
 * so a detail can be linked to and the back button closes it.
 *
 * @example
 * {userId && <Modal title={user.fullName} hideTitle closeHref={tableHref(searchParams, { user: null })}>…</Modal>}
 */
export function Modal({
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
}: ModalProps) {
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
            const exitMs = window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? 0
              : 150;
            setTimeout(() => router.push(closeHref, { scroll: false }), exitMs);
          }
        } else {
          onOpenChange?.(next);
        }
      }}
    >
      <DialogContent
        className={cn(
          side === "right"
            ? "top-0 right-0 left-auto h-dvh max-h-dvh w-[calc(100vw-16px)] max-w-[1220px] md:w-[70vw] translate-x-0 translate-y-0 rounded-l-3xl rounded-r-none motion-safe:animate-pop-in motion-safe:data-[state=closed]:animate-pop-out"
            : SIZE[size],
          className,
        )}
      >
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            !hideTitle && "px-6 pt-6",
          )}
        >
          <DialogTitle
            className={cn(
              hideTitle
                ? "sr-only"
                : "pr-10 text-[22px] leading-7 font-semibold text-foreground",
            )}
          >
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription
              className={cn(
                hideTitle
                  ? "sr-only"
                  : "mt-1 text-[13px] text-muted-foreground",
              )}
            >
              {description}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
