import Link from "next/link";
import { siteConfig } from "@/config/site";

const TILE_OPACITY = ["", "opacity-65", "opacity-80", ""];

export function AuthLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 self-start rounded-md">
      <span
        aria-hidden
        className="grid size-8 grid-cols-2 gap-[3px] rounded-[9px] bg-primary p-[7px] shadow-page-active"
      >
        {TILE_OPACITY.map((opacity, i) => (
          <span key={i} className={`rounded-[2.5px] bg-background ${opacity}`} />
        ))}
      </span>
      <span className="font-heading text-xl font-bold tracking-[-0.4px] text-foreground">
        {siteConfig.name}
      </span>
    </Link>
  );
}
