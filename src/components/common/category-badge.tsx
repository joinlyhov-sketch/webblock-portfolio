import type { ReactNode } from "react";
import { Cpu, Scissor } from "iconsax-reactjs";
import { CATEGORY_LABELS } from "@/config/categories";
import { cn } from "@/lib/utils";
import type { TemplateCategory } from "@/features/templates";

type CategoryMeta = { icon: ReactNode; className: string };

function ClothesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="m8 3.5 1.2 1.1a4.1 4.1 0 0 0 5.6 0L16 3.5l4.5 2.2-1.8 4-2.7-1.2V20H8V8.5l-2.7 1.2-1.8-4L8 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Salad2Icon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.4 12.3c.2-2.2 1.4-3.7 3.7-4.6-.2 2.2-1.4 3.7-3.7 4.6Zm4.3-.1c-.2-3.1 1-5.3 3.5-7 1 2.8.1 5.1-3.5 7Zm3.6.1c.5-2 2-3.1 4.4-3.2-.4 1.9-1.7 3-4.4 3.2ZM3.5 12.8h17l-1.4 4.9a2.4 2.4 0 0 1-2.3 1.7H7.2a2.4 2.4 0 0 1-2.3-1.7l-1.4-4.9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const categoryMeta = {
  CLOTHES: { icon: <ClothesIcon />, className: "bg-category-clothes-soft text-category-clothes" },
  FOOD_BEVERAGES: { icon: <Salad2Icon />, className: "bg-category-food-soft text-category-food" },
  TECHNOLOGY: { icon: <Cpu variant="Outline" />, className: "bg-category-tech-soft text-category-tech" },
  HANDMADE: { icon: <Scissor variant="Outline" />, className: "bg-category-handmade-soft text-category-handmade" },
} satisfies Record<TemplateCategory, CategoryMeta>;

/** Template / website category pill. */
export function CategoryBadge({
  category,
  className,
}: {
  category: TemplateCategory;
  className?: string;
}) {
  const meta = categoryMeta[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full py-[3px] pr-2.5 pl-2 text-xs font-medium whitespace-nowrap shadow-[0_1px_2px_rgb(60_120_207/0.06),0_1px_1px_rgb(60_120_207/0.04)] [&_svg]:size-3.5",
        meta.className,
        className,
      )}
    >
      {meta.icon}
      {CATEGORY_LABELS[category]}
    </span>
  );
}
