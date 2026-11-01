import Image from "next/image";
import { cn } from "@/lib/utils";

/** WebBlock AI's profile picture: the smiling cube mascot, shown exactly as designed. */
export function AiAvatar({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="WebBlock AI" className={cn("relative size-8 shrink-0", className)}>
      <Image src="/images/ai-avatar.png" alt="" fill unoptimized sizes="36px" className="object-contain" />
    </span>
  );
}
