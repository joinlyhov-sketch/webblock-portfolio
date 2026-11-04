const DOTS =
  "bg-[radial-gradient(var(--color-primary)_1.3px,transparent_1.4px)] bg-size-[10px_10px]";

/**
 * Figma hero background: dot grids, a small floating dot and soft circles behind the content.
 * Put it first inside a `relative isolate` container; it sits behind the rest (`-z-10`).
 */
export function HeroDecor({
  layout = "band",
  behindPicture = true,
}: {
  layout?: "band" | "card";
  /** "card" only: the soft circle behind the picture on the left. */
  behindPicture?: boolean;
}) {
  // "band": behind a short hero strip (website, subscription). "card": top of a white popup (user, notification).
  if (layout === "card") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[200px]"
      >
        <span className="absolute top-[69px] -right-[21px] size-[120px] rounded-full bg-brand-soft/80" />
        {behindPicture && <span className="absolute top-[69px] left-[19px] size-16 rounded-full bg-brand-soft/80" />}
        <span
          className={`absolute top-[15px] left-[17px] h-12 w-[60px] opacity-35 ${DOTS}`}
        />
        <span
          className={`absolute top-[91px] right-[121px] size-12 opacity-35 ${DOTS}`}
        />
      </div>
    );
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <span className="absolute -top-4 -right-16 size-44 rounded-full bg-brand-soft/80" />
      <span className="absolute top-[58%] -left-8 size-28 rounded-full bg-brand-soft/70" />
      <span
        className={`absolute top-3 left-6 h-[34px] w-[60px] opacity-35 ${DOTS}`}
      />
      <span
        className={`absolute top-[46%] right-[24%] h-10 w-10 opacity-35 ${DOTS}`}
      />
      <span className="absolute top-9 left-[62%] size-2 rounded-full bg-primary/60" />
    </div>
  );
}
