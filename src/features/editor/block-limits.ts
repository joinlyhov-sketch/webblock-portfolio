// How many blocks a page may hold. One source for the editor (Add / Duplicate / drag-in) and the save
// check in schemas.ts, so the two never disagree. The Spring backend must enforce the same numbers.
// Pure: no client or server imports.
import type { BlockName } from "./types";

/** Blocks on one page in total. The per-type limits add up to 13, so an owner can't use every slot. */
export const PAGE_BLOCK_LIMIT = 12;

/** Most blocks of each type on one page. */
export const BLOCK_TYPE_LIMITS = {
  Hero: 1,
  Text: 5,
  ProductCards: 3,
  AllProducts: 1,
  About: 1,
  VisitUs: 1,
  Footer: 1,
} as const satisfies Record<BlockName, number>;

type Block = { type: string };

export function countOfType(content: readonly Block[], type: BlockName): number {
  return content.filter((block) => block.type === type).length;
}

/** Why another `type` block can't be added, or null when it can. */
export function addBlockProblem(content: readonly Block[], type: BlockName): string | null {
  if (content.length >= PAGE_BLOCK_LIMIT) {
    return `A page holds up to ${PAGE_BLOCK_LIMIT} blocks. Remove one to add another.`;
  }
  const limit = BLOCK_TYPE_LIMITS[type];
  if (countOfType(content, type) >= limit) {
    return limit === 1 ? "Your page already has one." : `Up to ${limit} per page.`;
  }
  return null;
}

/** Index of the Footer, which always stays the last block; -1 when the page has none. */
export function footerIndex(content: readonly Block[]): number {
  return content.findIndex((block) => block.type === "Footer");
}
