"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Camera } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { Modal } from "@/components/common/modal";
import { PhotoPreviewModal } from "@/components/common/photo-preview-modal";
import { toast } from "@/components/common/toast";
import { UploadImageModal } from "@/components/common/upload-image-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVATAR_RULE } from "@/lib/image-rules";
import { FULL_NAME_MAX } from "@/lib/validation/fields";
import {
  removeAdminAvatarAction,
  updateAdminProfileAction,
  uploadAdminAvatarAction,
} from "../actions";
import type { AdminProfile } from "../types";

const AVATAR_STYLE = "size-[76px] border-4 border-background text-[26px] shadow-avatar ring-0";

/** "Edit profile" popup: same fields and photo flow as the user's Settings → Profile (name editable, email locked). */
export function EditAdminProfileDialog({
  open,
  onClose,
  profile,
  startWithUpload = false,
}: {
  open: boolean;
  onClose: () => void;
  profile: AdminProfile;
  /** Show only the photo upload popup (the camera badge on the profile card), not the form. */
  startWithUpload?: boolean;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [removing, startRemove] = useTransition();
  const [nameValue, setNameValue] = useState(profile.fullName);
  const [nameTouched, setNameTouched] = useState(false);
  const [state, formAction, saving] = useActionState(updateAdminProfileAction, null);

  // Start from the saved name each time the popup opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setNameValue(profile.fullName);
      setNameTouched(false);
      setUploadOpen(startWithUpload);
    }
  }

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "Profile saved");
    else if (!state.fieldErrors) toast.error("Could not save your profile", state.message);
  }, [state]);

  async function upload(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.set("photo", file);
    const result = await uploadAdminAvatarAction(formData);
    if (result.ok) toast.success(result.message ?? "Photo updated");
    else toast.error("Upload failed", result.message);
    return result.ok;
  }

  function removePhoto() {
    startRemove(async () => {
      const result = await removeAdminAvatarAction();
      if (result.ok) toast.danger(result.message ?? "Photo removed");
      else toast.error("Could not remove the photo", result.message);
    });
  }

  const nameError = nameTouched && !nameValue.trim()
    ? "Enter your full name."
    : state && !state.ok && state.values?.fullName === nameValue
      ? state.fieldErrors?.fullName?.[0]
      : undefined;
  const unchanged = nameValue.trim() === profile.fullName;

  return (
    <>
      <Modal
        open={open && !startWithUpload}
        onOpenChange={(next) => !next && onClose()}
        title="Edit profile"
        description="This is how you appear to other admins."
        size="md"
      >
        <div className="flex flex-col gap-6 px-6 pt-4 pb-6">
          <div className="flex flex-wrap items-center gap-[18px] rounded-[14px] border border-border bg-muted p-[18px]">
            <span className="relative size-[76px] shrink-0">
              {/* The photo opens a larger preview (or the upload when there is no photo yet); the camera uploads. */}
              <button
                type="button"
                aria-label={profile.avatarUrl ? "View photo" : "Add photo"}
                onClick={() => (profile.avatarUrl ? setViewOpen(true) : setUploadOpen(true))}
                className="block rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <Avatar variant="solid" name={profile.fullName} src={profile.avatarUrl} className={AVATAR_STYLE} />
              </button>
              <button
                type="button"
                aria-label="Change photo"
                onClick={() => setUploadOpen(true)}
                className="absolute top-[54px] left-[54px] flex size-[26px] items-center justify-center rounded-full border-2 border-background bg-brand text-primary-foreground outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <Camera variant="Outline" aria-hidden className="size-3.5" />
              </button>
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                Upload photo
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={removePhoto}
                loading={removing}
                disabled={!profile.avatarUrl}
              >
                Remove
              </Button>
            </div>
          </div>

          <form
            action={formAction}
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              if (!nameValue.trim()) {
                event.preventDefault();
                setNameTouched(true);
              }
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-fullName" className="text-sm font-medium">Full name</label>
              <Input
                id="admin-fullName"
                name="fullName"
                maxLength={FULL_NAME_MAX}
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                onBlur={() => setNameTouched(true)}
                autoComplete="name"
                aria-invalid={!!nameError}
                aria-required="true"
                className="h-[46px] rounded-xl border-border px-3.5 text-sm"
              />
              {nameError && <p role="alert" className="text-xs text-danger">{nameError}</p>}
              {nameValue.length >= FULL_NAME_MAX && (
                <p role="status" className="text-xs text-danger">
                  You’ve reached the {FULL_NAME_MAX}-character limit.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium">Email</label>
              <Input
                id="admin-email"
                value={profile.email}
                disabled
                readOnly
                aria-describedby="admin-email-hint"
                className="h-[46px] rounded-xl border-border bg-field-locked px-3.5 text-sm text-muted-foreground/60 disabled:bg-field-locked disabled:text-muted-foreground/60"
              />
              <p id="admin-email-hint" className="text-xs text-hint">Your email can’t be changed.</p>
            </div>
            <div className="flex justify-end gap-2.5">
              <Button type="button" variant="secondary" size="lg" className="h-[46px]" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" size="lg" className="h-[46px]" loading={saving} disabled={unchanged}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <PhotoPreviewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Profile photo"
        changeLabel="Change photo"
        onChange={() => setUploadOpen(true)}
      >
        <Avatar
          variant="solid"
          name={profile.fullName}
          src={profile.avatarUrl}
          className={`${AVATAR_STYLE} size-60 text-6xl`}
        />
      </PhotoPreviewModal>

      <UploadImageModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          // Opened from the camera badge: closing the upload closes everything.
          if (startWithUpload) onClose();
        }}
        rule={AVATAR_RULE}
        onUpload={upload}
        cropCircle
      />
    </>
  );
}
