"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Camera, User } from "iconsax-reactjs";
import {
  removeAvatarAction,
  updateProfileAction,
  uploadAvatarAction,
} from "../actions";
import { Avatar } from "@/components/common/avatar";
import { toast } from "@/components/common/toast";
import { UploadImageModal } from "@/components/common/upload-image-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVATAR_RULE } from "@/lib/image-rules";
import type { Profile } from "../types";
import { Field, SETTINGS_FIELD, SettingsCard } from "./settings-card";

/** Profile card: photo, member dates and the editable full name. `memberSince` / `lastSignIn` are preformatted. */
export function ProfileCard({
  profile,
  planLabel,
  memberSince,
  lastSignIn,
}: {
  profile: Profile;
  planLabel: string;
  memberSince: string;
  lastSignIn: string;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removing, startRemove] = useTransition();
  const [state, formAction, saving] = useActionState(updateProfileAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "Profile saved");
    else toast.error("Could not save", state.message);
  }, [state]);

  async function upload(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.set("photo", file);
    const result = await uploadAvatarAction(formData);
    if (result.ok) toast.success(result.message ?? "Photo updated");
    else toast.error("Upload failed", result.message);
    return result.ok;
  }

  function removePhoto() {
    startRemove(async () => {
      const result = await removeAvatarAction();
      if (result.ok) toast.success(result.message ?? "Photo removed");
      else toast.error("Could not remove the photo", result.message);
    });
  }

  const nameError = state && !state.ok ? state.fieldErrors?.fullName?.[0] : undefined;

  return (
    <SettingsCard
      icon={<User />}
      title="Profile"
      description="This is how WebBlock know you"
      className="w-full xl:w-[684px] xl:shrink-0 xl:self-stretch"
    >
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-[14px] border border-border bg-muted">
          <div className="flex flex-wrap items-center gap-[18px] p-[22px]">
            <span className="relative size-[76px] shrink-0">
              <Avatar
                name={profile.fullName}
                initials={profile.initials}
                src={profile.avatarUrl}
                className="size-[76px] border-4 border-background from-avatar-from to-violet-border text-[32px] leading-[33px] shadow-avatar"
              />
              <button
                type="button"
                aria-label="Change photo"
                onClick={() => setUploadOpen(true)}
                className="absolute top-[54px] left-[54px] flex size-[26px] items-center justify-center rounded-full border-2 border-background bg-brand text-primary-foreground outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <Camera aria-hidden className="size-3.5" />
              </button>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <p className="truncate font-heading text-lg font-semibold">{profile.fullName}</p>
                <span className="inline-flex h-[22px] items-center rounded-md bg-badge-soft px-2 text-[11px] font-semibold tracking-[0.66px] whitespace-nowrap text-brand uppercase">
                  {planLabel}
                </span>
              </div>
              <div aria-hidden className="h-[17px]" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
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
              <p className="text-xs text-hint">JPG or PNG, up to 2 MB</p>
            </div>
          </div>
          <dl className="flex gap-6 border-t border-border bg-background/60 px-[22px] pt-3.5 pb-4">
            <div className="flex flex-1 flex-col gap-[3px]">
              <dt className="text-xs text-hint">Member since</dt>
              <dd className="text-[13px] font-semibold">{memberSince}</dd>
            </div>
            <div className="flex flex-1 flex-col gap-[3px]">
              <dt className="text-xs text-hint">Last sign-in</dt>
              <dd className="text-[13px] font-semibold">{lastSignIn}</dd>
            </div>
            <div className="flex-1" />
          </dl>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <Field id="fullName" label="Full name" hint="Shown on your website header." error={nameError}>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={state && !state.ok ? (state.values?.fullName ?? profile.fullName) : profile.fullName}
              autoComplete="name"
              aria-invalid={!!nameError}
              aria-describedby="fullName-hint"
              className={SETTINGS_FIELD}
            />
          </Field>
          <Field id="email" label="Email" hint="Your email can’t be changed.">
            <Input
              id="email"
              value={profile.email}
              disabled
              readOnly
              aria-describedby="email-hint"
              className={`${SETTINGS_FIELD} bg-field-locked text-muted-foreground/60 disabled:bg-field-locked disabled:text-muted-foreground/60`}
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="h-[46px]" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </div>

      <UploadImageModal open={uploadOpen} onClose={() => setUploadOpen(false)} rule={AVATAR_RULE} onUpload={upload} />
    </SettingsCard>
  );
}
