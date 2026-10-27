"use client";

import { useState, type ReactNode } from "react";
import { Copy, TickCircle } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import type { AdminProfile } from "../types";

/** Header avatar (Figma "Header · Admin profile"): opens the read-only "Admin profile" card. */
export function AdminProfileMenu({ profile }: { profile: AdminProfile }) {
  const [copied, setCopied] = useState(false);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(profile.accountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context): the ID stays selectable in the field.
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Admin profile"
          className="rounded-full outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-95"
        >
          <Avatar
            name={profile.fullName}
            src={profile.avatarUrl}
            className="size-10 text-xs"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Admin profile"
        // Don't drop focus into the first read-only field (it would select its text).
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="end"
        sideOffset={8}
        className="w-[min(280px,calc(100vw-32px))] rounded-[22px] px-4 pt-5 pb-4 shadow-popover"
      >
        <h2 className="text-lg font-semibold text-foreground">Admin profile</h2>

        <div className="mt-4 flex items-center gap-3.5">
          <Avatar
            name={profile.fullName}
            src={profile.avatarUrl}
            className="size-11 text-sm ring-0"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {profile.fullName}
            </p>
            <p className="truncate text-[13px] text-muted-foreground">
              {profile.title}
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-3">
          <ProfileField label="Name" value={profile.fullName} />
          <ProfileField label="Email" value={profile.email} />
          <ProfileField
            label="Account ID"
            value={profile.accountCode}
            action={
              <button
                type="button"
                onClick={copyId}
                aria-label={copied ? "Account ID copied" : "Copy account ID"}
                className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-foreground-soft outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {copied ? (
                  <TickCircle className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            }
          />
          <ProfileField label="Joined" value={formatDate(profile.joinedAt)} />
        </dl>
        <span aria-live="polite" className="sr-only">
          {copied ? "Account ID copied" : ""}
        </span>
      </PopoverContent>
    </Popover>
  );
}

function ProfileField({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: ReactNode;
}) {
  const id = `admin-profile-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-1">
      <dt>
        <label htmlFor={id} className="text-xs text-muted-foreground">
          {label}
        </label>
      </dt>
      <dd className="relative">
        <Input
          id={id}
          readOnly
          value={value}
          className="h-10 rounded-xl text-[13px] pr-10"
        />
        {action}
      </dd>
    </div>
  );
}
