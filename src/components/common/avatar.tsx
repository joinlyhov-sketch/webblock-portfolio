import Image from "next/image";
import { cn } from "@/lib/utils";

/** Round avatar: the photo, or the person's initials on the soft blue gradient when there is none. */
export function Avatar({
  name,
  initials,
  src,
  className,
}: {
  name: string;
  /** Letters shown without a photo, e.g. "SV". */
  initials: string;
  src: string | null;
  /** Size and text size, e.g. "size-9 text-[13px]". */
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-[140deg] from-brand-soft to-violet-border font-bold text-brand-deep",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill unoptimized sizes="96px" className="object-cover" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
