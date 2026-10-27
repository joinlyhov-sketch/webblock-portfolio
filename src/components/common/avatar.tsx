import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: { box: "size-7 text-[11px]", px: 28 },
  md: { box: "size-9 text-[13px]", px: 36 },
  lg: { box: "size-[72px] text-xl", px: 72 },
} as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Round photo, or the person's initials when `src` is null. */
export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src: string | null;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand font-bold text-primary-foreground ring-2 ring-background",
        s.box,
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" width={s.px} height={s.px} className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}

/** Small rounded-square website thumbnail; a neutral tile when there is no image yet. */
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
      className={cn(
        "relative inline-block shrink-0 overflow-hidden border border-border bg-muted",
        size === "lg" ? "aspect-[4/3] w-[120px] rounded-2xl" : "rounded-lg",
        size === "sm" && "size-7",
        size === "md" && "size-9",
        className,
      )}
    >
      {src && (
        <Image
          src={src}
          alt=""
          width={px}
          height={size === "lg" ? 90 : px}
          className="size-full object-cover"
        />
      )}
    </span>
  );
}
