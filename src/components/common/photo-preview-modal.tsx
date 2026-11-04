"use client";

import type { ReactNode } from "react";
import { Camera } from "iconsax-reactjs";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";

/**
 * Larger view of a profile photo or logo, opened by clicking the small one. "Change" closes this
 * popup and hands over to the caller's upload popup. `children` is the big image (e.g. an `Avatar`).
 *
 * @example
 * <PhotoPreviewModal open={viewOpen} onClose={() => setViewOpen(false)} title="Profile photo"
 *   changeLabel="Change photo" onChange={() => setUploadOpen(true)}>
 *   <Avatar … className="size-60 text-6xl" />
 * </PhotoPreviewModal>
 */
export function PhotoPreviewModal({
  open,
  onClose,
  title,
  changeLabel,
  onChange,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  changeLabel: string;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      title={title}
      size="sm"
      open={open}
      onOpenChange={(next) => !next && onClose()}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onChange();
            }}
          >
            <Camera variant="Outline" aria-hidden /> {changeLabel}
          </Button>
        </>
      }
    >
      <div className="grid place-items-center py-6">{children}</div>
    </Modal>
  );
}
