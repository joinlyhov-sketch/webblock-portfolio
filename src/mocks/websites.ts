import type { MediaAsset, WebsitePage } from "@/features/editor/types";
import type { Website } from "@/features/websites/types";
import { templatePages } from "./template-pages";

// Kept on globalThis so writes survive hot reload and are shared by every route in dev.
// Everything resets when the server restarts — fine for mocks.
const store = globalThis as typeof globalThis & {
  __wbWebsites?: Website[];
  __wbWebsitePages?: WebsitePage[];
};

const PETAL_ID = "7d3e9b2a-1c4f-4a8e-b6d5-3f2e1a9c8b70";
const KILN_ID = "b4f1c8d2-6e3a-4b9f-a2d7-1c5e8f0b3a64";

export const websites: Website[] = (store.__wbWebsites ??= [
  {
    id: PETAL_ID,
    name: "Petal & Stem",
    templateId: "3b8f2d61-9c4e-4a7b-8e15-6d2a9f0c4e11",
    templateKey: "everyday-store",
    subdomain: "petalandstem",
    status: "LIVE",
    thumbnailUrl: "/mock/templates/everyday-store/thumbnail.webp",
    createdAt: "2026-10-02T03:15:00Z",
    updatedAt: "2026-10-20T09:42:00Z",
    publishedAt: "2026-10-20T09:45:00Z",
  },
  {
    id: KILN_ID,
    name: "Kiln Coffee",
    templateId: "c2d95e08-7a1b-4f63-9b4d-8e0a3c5f7b53",
    templateKey: "warm-bold",
    subdomain: "kilncoffee",
    status: "DRAFT",
    thumbnailUrl: "/mock/templates/warm-bold/thumbnail.webp",
    createdAt: "2026-10-22T07:30:00Z",
    updatedAt: "2026-10-24T11:05:00Z",
    publishedAt: null,
  },
]);

export const websitePages: WebsitePage[] = (store.__wbWebsitePages ??= [
  {
    websiteId: PETAL_ID,
    draft: structuredClone(templatePages["everyday-store"]),
    published: structuredClone(templatePages["everyday-store"]),
    updatedAt: "2026-10-20T09:42:00Z",
    publishedAt: "2026-10-20T09:45:00Z",
  },
  {
    websiteId: KILN_ID,
    draft: structuredClone(templatePages["warm-bold"]),
    published: null,
    updatedAt: "2026-10-24T11:05:00Z",
    publishedAt: null,
  },
]);

/** Image library shown under "Replace image": every template photo (stand-in for the owner's uploads). */
const MEDIA_FILES: [folder: string, files: string[]][] = [
  ["everyday-store", ["hero", "gift-bouquet", "stone-vase", "lily-bunch", "table-arrangement", "spring-tulip-bunch"]],
  ["sweet-pastel", ["cupcake-stand", "strawberry-cupcake", "lemon-tart", "chocolate-fudge-cake", "birthday-box", "cinnamon-roll", "about-baker"]],
  ["warm-bold", ["hero-espresso", "espresso-bag", "cold-brew", "flat-white", "cinnamon-bun", "ceramic-cup", "roaster"]],
  ["clean-mono", ["hero-headphones-white", "over-ear-wireless", "true-wireless-earbuds", "pocket-speaker", "usb-c-cable", "listening-bar"]],
];

export const mediaAssets: MediaAsset[] = MEDIA_FILES.flatMap(([folder, files]) =>
  files.map((file) => ({ folder, file })),
).map(({ folder, file }, i) => ({
  id: `a1c0e2d4-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  url: `/mock/templates/${folder}/${file}.webp`,
  name: `${file}.webp`,
}));
