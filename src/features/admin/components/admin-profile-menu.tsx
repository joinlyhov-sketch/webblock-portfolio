"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Calendar, Camera, Copy, Edit2, Logout, MagicStar, Personalcard, ShieldTick, Sms, TickCircle } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PhotoPreviewModal } from "@/components/common/photo-preview-modal";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminProfile } from "../types";
import { EditAdminProfileDialog } from "./edit-admin-profile-dialog";

/**
 * Header avatar (Figma "Header · Admin profile"): opens the "Admin profile" card. The photo opens a
 * larger preview, the camera badge uploads a new one, and the card ends with Edit profile and Log out
 * (the only way to sign out below 1024px, where the sidebar and its log out button are hidden).
 */
export function AdminProfileMenu({ profile }: { profile: AdminProfile }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUpload, setEditUpload] = useState(false);

  /** Popups live outside the card, so close the card first and they survive it. */
  function openEdit(upload: boolean) {
    setMenuOpen(false);
    setEditUpload(upload);
    setEditOpen(true);
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(profile.accountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context): the ID stays selectable in the card.
    }
  }

  return (
    <>
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Admin profile"
          className="rounded-full outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-95"
        >
          <Avatar variant="solid"
            name={profile.fullName}
            src={profile.avatarUrl}
            className="size-10 text-[13px]"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Admin profile"
        // Don't move focus into the card on open (the copy button would grab it).
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(300px,calc(100vw-32px))] overflow-hidden rounded-[24px] p-0"
      >
        <h2 className="sr-only">Admin profile</h2>

        {/* Cover: light blue gradient with a faint dot grid fading out, same family as the confirm popups. */}
        <div aria-hidden className="relative h-[84px] overflow-hidden bg-linear-to-b from-brand-soft to-primary-soft/40">
          <span className="absolute inset-0 bg-[radial-gradient(var(--color-decor-dot)_1.2px,transparent_1.4px)] bg-size-[12px_12px] mask-b-from-20% opacity-70" />
          {/* Two soft light spots for depth. */}
          <span className="absolute -top-10 -left-8 size-28 rounded-full bg-primary/15 blur-2xl" />
          <span className="absolute -top-12 -right-6 size-32 rounded-full bg-violet-border blur-2xl" />
          {/* Little sparkles in the empty corners. */}
          <MagicStar variant="Outline" className="absolute top-4 right-6 size-3.5 text-brand-border" />
          <MagicStar variant="Outline" className="absolute top-9 left-7 size-2.5 text-brand-border" />
        </div>

        <div className="-mt-10 flex flex-col items-center px-4 text-center">
          {/* Avatar in a thin blue gradient ring: a green "signed in" dot top-right, the camera badge bottom-right. */}
          <span className="relative grid rounded-full bg-linear-to-br from-primary to-brand-border p-[3px] shadow-card motion-safe:animate-fade-up">
            {/* The photo opens a larger preview (or the upload when there is no photo yet). */}
            <button
              type="button"
              aria-label={profile.avatarUrl ? "View photo" : "Add photo"}
              onClick={() => {
                if (!profile.avatarUrl) return openEdit(true);
                setMenuOpen(false);
                setViewOpen(true);
              }}
              className="block rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <Avatar
                variant="solid"
                name={profile.fullName}
                src={profile.avatarUrl}
                className="size-[70px] text-lg ring-[3px] ring-background"
              />
            </button>
            <span className="absolute top-1 right-1 size-3.5 rounded-full bg-success ring-[2.5px] ring-background">
              <span className="sr-only">Signed in</span>
            </span>
            <button
              type="button"
              aria-label="Change photo"
              onClick={() => openEdit(true)}
              className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-[3px] border-background bg-brand text-primary-foreground outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <Camera variant="Outline" aria-hidden className="size-3.5" />
            </button>
          </span>
          <p className="mt-3 max-w-full truncate font-heading text-lg leading-6 font-semibold text-foreground">
            {profile.fullName}
          </p>
          <Pill tone="brand" icon={<ShieldTick variant="Outline" aria-hidden />} className="mt-1.5">
            {profile.title}
          </Pill>
        </div>

        <ul className="m-4 mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/60 motion-safe:animate-fade-up motion-safe:[animation-delay:80ms]">
          <ProfileRow icon={<Sms variant="Outline" />} label="Email" value={profile.email} />
          <ProfileRow
            icon={<Personalcard variant="Outline" />}
            label="Account ID"
            value={profile.accountCode}
            mono
            action={
              <button
                type="button"
                onClick={copyId}
                aria-label={copied ? "Account ID copied" : "Copy account ID"}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-foreground-soft outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {copied ? (
                  <TickCircle variant="Outline" className="size-4 text-success" />
                ) : (
                  <Copy variant="Outline" className="size-4" />
                )}
              </button>
            }
          />
          <ProfileRow
            icon={<Calendar variant="Outline" />}
            label="Joined"
            value={formatDate(profile.joinedAt)}
          />
        </ul>
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <Button variant="secondary" onClick={() => openEdit(false)}>
            <Edit2 variant="Outline" aria-hidden />
            Edit profile
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              // Close the card first: the confirm popup lives outside it, so it survives the close.
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
          >
            <Logout variant="Outline" aria-hidden />
            Log out
          </Button>
        </div>
        <span aria-live="polite" className="sr-only">
          {copied ? "Account ID copied" : ""}
        </span>
      </PopoverContent>
    </Popover>

    <ConfirmDialog
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      onConfirm={() => startSignOut(() => signOutAction())}
      loading={signingOut}
      icon={<Logout variant="Outline" />}
      title="Log out of WebBlock?"
      description="You’ll need to sign in again to manage the platform."
      confirmLabel="Log out"
      look="soft"
    />

    <PhotoPreviewModal
      open={viewOpen}
      onClose={() => setViewOpen(false)}
      title="Profile photo"
      changeLabel="Change photo"
      onChange={() => openEdit(true)}
    >
      <Avatar variant="solid" name={profile.fullName} src={profile.avatarUrl} className="size-60 text-6xl ring-0" />
    </PhotoPreviewModal>
    <EditAdminProfileDialog
      open={editOpen}
      onClose={() => setEditOpen(false)}
      profile={profile}
      startWithUpload={editUpload}
    />
    </>
  );
}

/** One "icon · label / value" line of the profile card; `action` sits on the right (e.g. copy). */
function ProfileRow({
  icon,
  label,
  value,
  mono = false,
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  /** Tabular digits for codes like "ADM-000001". */
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <li className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-background">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-xl bg-background text-brand shadow-button transition-colors group-hover:bg-brand-soft [&_svg]:size-4"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs leading-4 text-muted-foreground">{label}</p>
        <p
          className={cn(
            "truncate text-sm leading-5 font-medium text-foreground select-all",
            mono && "tabular-nums tracking-wide",
          )}
          title={value}
        >
          {value}
        </p>
      </div>
      {action}
    </li>
  );
}
