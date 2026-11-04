/**
 * iconsax has no tablet glyph (its `Devices` is a monitor + phone): a small outline tablet in the
 * same 24px / 1.5px linear style as the iconsax Outline icons. `variant` is accepted (and ignored)
 * so it can sit in the same list as iconsax icons.
 */
export function TabletIcon({ className }: { className?: string; variant?: "Outline" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <rect x="4.5" y="2.5" width="15" height="19" rx="3" />
      <path d="M11 18.5h2" />
    </svg>
  );
}
