import Image from "next/image";
import { Float } from "@/components/common/motion";
import { cn } from "@/lib/utils";

// Decorative background pieces shared by the landing sections. All aria-hidden, pointer-events-none.

/** 32px dot grid (1.6px dots) fading out from the centre, as the Figma "Dot grid" layers. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        "bg-[radial-gradient(circle,var(--color-decor-dot)_1.6px,transparent_1.7px)] bg-size-[32px_32px] bg-position-[0_0]",
        "mask-[radial-gradient(ellipse_at_center,black_0%,rgb(0_0_0/0.9)_55%,transparent_100%)]",
        className,
      )}
    />
  );
}

/** Small rounded diamond that floats gently. Position it with `className` (absolute). */
export function Diamond({
  className,
  size = 12,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <Float className={cn("pointer-events-none absolute", className)} y={8} duration={5} delay={delay}>
      <span
        className="block rotate-45 rounded-[3px] bg-decor-diamond"
        style={{ width: size, height: size }}
      />
    </Float>
  );
}

type OrbColor = "blue" | "lavender" | "mint";

/** Blur margin baked into the orb SVGs (stdDeviation 70 → 140px on each side). */
const ORB_BLUR = 140;

/** Blurred "glass orb" colour wash. `size` is the circle; the SVG adds its blur margin around it. */
export function GlassOrb({
  color,
  size,
  className,
}: {
  color: OrbColor;
  size: number;
  className?: string;
}) {
  const box = size + 2 * ORB_BLUR;
  return (
    <Image
      aria-hidden
      alt=""
      src={`/landing/decor/orb-${color}.svg`}
      width={box}
      height={box}
      className={cn("pointer-events-none absolute max-w-none select-none", className)}
      style={{ margin: -ORB_BLUR }}
    />
  );
}
