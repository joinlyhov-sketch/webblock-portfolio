"use client";

import { useEffect, useRef, useState } from "react";

/** Width the site is laid out at before it is scaled down to fit the card (a desktop screen). */
const SITE_WIDTH = 1280;

/**
 * The deployed website itself, shrunk to the card: an iframe of the published page laid out at desktop
 * width and scaled down, so the card always shows what visitors see now. It is not clickable or
 * focusable; the card's own buttons stay the only controls.
 */
export function LiveSitePreview({
  src,
  name,
}: {
  /** The page to show: the published site, or the saved draft for a website never deployed. */
  src: string;
  name: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  // Each preview is a whole website (its scripts, fonts and images), so it only starts loading once the
  // card is on screen. Until then the template screenshot under it shows. Native `loading="lazy"` isn't
  // enough: Chrome starts lazy iframes over a screen away, so every card on the list loaded at once.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    const view = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        view.disconnect();
      },
      { rootMargin: "100px" },
    );
    view.observe(el);
    return () => {
      resize.disconnect();
      view.disconnect();
    };
  }, []);

  const scale = size ? size.width / SITE_WIDTH : 0;

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {size && visible && (
        <iframe
          src={src}
          title={`${name} preview`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0 bg-background"
          style={{
            width: SITE_WIDTH,
            height: size.height / scale,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  );
}
