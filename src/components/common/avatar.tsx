import Image from "next/image";
import { Global } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-[72px] text-xl",
} as const;

/** "Sokha Chan" → "SC" · "Admin" → "AD" */
function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Round avatar: the photo, or the person's initials on the soft blue gradient when there is none. */
export function Avatar({
  name,
  initials,
  src,
  size = "md",
  className,
}: {
  name: string;
  /** Letters shown without a photo, e.g. "SV". Defaults to the first letters of `name`. */
  initials?: string;
  src: string | null;
  size?: keyof typeof SIZE;
  /** Extra classes, e.g. a custom size "size-[104px] text-2xl" or `planRing(plan)`. */
  className?: string;
}) {
  return (
    <span
      data-avatar
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-[140deg] from-brand-soft to-violet-border font-bold text-brand-deep",
        SIZE[size],
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill unoptimized sizes="104px" className="object-cover" />
      ) : (
        <span aria-hidden>{initials ?? initialsOf(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

/** Small rounded-square website thumbnail; a globe placeholder (plus "No preview" when large) when there is no image yet. */
export function Thumbnail({
  src,
  size = "md",
  className,
}: {
  src: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "sm" ? 28 : size === "md" ? 36 : 120;
  return (
    <span
      data-thumb
      className={cn(
        "relative inline-block shrink-0 overflow-hidden border border-border bg-muted",
        size === "lg" ? "aspect-[4/3] w-[120px] rounded-2xl" : "rounded-lg",
        size === "sm" && "size-7",
        size === "md" && "size-9",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={px}
          height={size === "lg" ? 90 : px}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1 bg-primary-soft text-primary/70">
          <Global
            aria-hidden
            className={cn(
              size === "sm"
                ? "size-3.5"
                : size === "md"
                  ? "size-[18px]"
                  : "size-7",
            )}
          />
          {size === "lg" && (
            <span className="text-[11px] font-medium text-muted-foreground">
              No preview
            </span>
          )}
        </span>
      )}
    </span>
  );
}
