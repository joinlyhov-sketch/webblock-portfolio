"use client";

import { useState } from "react";
import { motion, RevealGroup, RevealItem } from "@/components/common/motion";
import { ScaleToFit } from "@/components/common/scale-to-fit";
import { cn } from "@/lib/utils";
import { BrowserMock, showcaseTemplates, type ShowcaseTemplate } from "./template-mock";

/** Damped spring curve exported by Figma for the fan-in (slight overshoot, then settle). */
const springEase = (t: number) =>
  1 - Math.exp(-t * 7.6657) * (Math.cos(t * 6.7605) + 1.1339 * Math.sin(t * 6.7605));

type FanCard = {
  template: ShowcaseTemplate;
  /** Top-left of the unrotated 410×257 card inside the fan box. */
  left: number;
  top: number;
  rotate: number;
  /** Entrance offset: cards fly out from the centre. */
  fromX: number;
  fromY: number;
  delay: number;
};

const [petal, sugar, kiln, northpoint] = showcaseTemplates;

// Figma "Template fan" (1280×472), back to front. Kiln Coffee is drawn last so it sits on top.
const desktopFan: FanCard[] = [
  { template: sugar, left: 3, top: 64, rotate: -8, fromX: 450, fromY: 40, delay: 0.1 },
  { template: petal, left: 293, top: 43, rotate: -3, fromX: 150, fromY: 80, delay: 0.2 },
  { template: northpoint, left: 867, top: 121, rotate: 8, fromX: -450, fromY: 40, delay: 0.3 },
  { template: kiln, left: 580, top: 65, rotate: 3, fromX: -150, fromY: 80, delay: 0.4 },
];

// Below md: all four cards in a tilted 2×2 collage (840×560 box, scaled to fit), Kiln Coffee on top.
const mobileFan: FanCard[] = [
  { template: northpoint, left: 405, top: 275, rotate: -3, fromX: -200, fromY: -130, delay: 0.1 },
  { template: petal, left: 25, top: 265, rotate: 3, fromX: 200, fromY: -130, delay: 0.2 },
  { template: sugar, left: 415, top: 35, rotate: 4, fromX: -200, fromY: 130, delay: 0.3 },
  { template: kiln, left: 15, top: 25, rotate: -4, fromX: 200, fromY: 130, delay: 0.4 },
];

function Fan({
  cards,
  width,
  height,
  selected,
  className,
}: {
  cards: FanCard[];
  width: number;
  height: number;
  /** Style the viewer picked; null keeps the Figma stacking. */
  selected: string | null;
  className?: string;
}) {
  return (
    <ScaleToFit width={width} height={height} className={cn("mx-auto overflow-visible", className)}>
      <motion.div
        className="relative size-full"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.3 }}
      >
        {cards.map((card, i) => {
          const isSelected = card.template.style === selected;
          return (
            <motion.div
              key={card.template.slug}
              className="absolute"
              style={{ left: card.left, top: card.top, zIndex: isSelected ? cards.length : i }}
              variants={{
                hidden: { opacity: 0, x: card.fromX, y: card.fromY, rotate: 0, scale: 0.9 },
                shown: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: card.rotate,
                  scale: 1,
                  transition: {
                    default: { duration: 0.9, ease: springEase, delay: card.delay },
                    scale: { duration: 0.75, ease: springEase, delay: card.delay },
                    opacity: { duration: 0.4, ease: "easeOut", delay: card.delay },
                  },
                },
              }}
            >
              <motion.div
                animate={{ y: isSelected ? -12 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <BrowserMock template={card.template} size="sm" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </ScaleToFit>
  );
}

/**
 * The tilted template fan plus the style chips. Picking a style lifts its card to the front; it is a
 * preview only and does not filter anything.
 */
export function TemplateFan() {
  // Null until the viewer picks a chip, so the fan first shows the Figma composition.
  const [picked, setPicked] = useState<string | null>(null);
  const activeStyle = picked ?? kiln.style;

  return (
    <div className="flex w-full flex-col items-center gap-8 md:gap-10">
      <Fan cards={desktopFan} width={1280} height={472} selected={picked} className="hidden md:block" />
      <Fan cards={mobileFan} width={840} height={560} selected={picked} className="md:hidden" />

      <RevealGroup className="flex flex-wrap justify-center gap-2" stagger={0.08}>
        {showcaseTemplates.map((template) => {
          const active = template.style === activeStyle;
          return (
            <RevealItem key={template.slug} y={14}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setPicked(template.style)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none sm:px-5 sm:py-2.5 sm:text-base",
                  "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
                  active
                    ? "bg-brand text-primary-foreground shadow-button"
                    : "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
                )}
              >
                {template.style}
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
