import { cn } from "@/lib/utils";

/** WebBlock app icon (Figma "Logo · WebBlock icon"): four tiles on the brand gradient. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-[26px] shrink-0 grid-cols-2 grid-rows-2 gap-[3px] rounded-[7px] bg-linear-145 from-logo-from to-logo-to p-[5.7px] shadow-logo",
        className,
      )}
    >
      <span className="rounded-[2px] bg-background" />
      <span className="rounded-[2px] bg-background/65" />
      <span className="rounded-[2px] bg-background/80" />
      <span className="rounded-[2px] bg-background" />
    </span>
  );
}

/** Logo mark + "WebBlock" wordmark. `lg` is the footer size (40px mark). */
export function Logo({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center", size === "lg" ? "gap-3" : "gap-2.5", className)}>
      <LogoMark className={size === "lg" ? "size-10 rounded-[11px] p-[8.75px]" : undefined} />
      <span className="font-heading text-xl leading-[30px] font-semibold text-foreground">
        WebBlock
      </span>
    </span>
  );
}
