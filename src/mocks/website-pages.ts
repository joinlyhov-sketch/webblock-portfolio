import type { MediaAsset, WebsitePage } from "@/features/editor/types";
import { LANTERN_CAFE_ID, MAPLE_AND_RYE_ID, NORTHPOINT_AUDIO_ID, PETAL_AND_STEM_ID } from "./session";
import { templatePages } from "./template-pages";
import { templateSites } from "./template-sites";
import { daysAgo, hoursAgo } from "./time";

// Kept on globalThis so editor saves survive hot reload and are shared by every route in dev.
const store = globalThis as typeof globalThis & { __wbWebsitePages?: WebsitePage[] };

/** What the backend does on "Use template": copy the template's default page into the new website. */
export function newWebsitePage(websiteId: string, templateId: string, updatedAt: string): WebsitePage {
  const site = templateSites[templateId];
  if (!site) throw new Error(`Mock: no template page for template ${templateId}`);
  return {
    websiteId,
    draft: structuredClone(templatePages[site.slug]),
    published: null,
    updatedAt,
    publishedAt: null,
  };
}

function published(page: WebsitePage, publishedAt: string): WebsitePage {
  return { ...page, published: structuredClone(page.draft), publishedAt };
}

// Template ids match src/mocks/websites.ts.
export const websitePages: WebsitePage[] = (store.__wbWebsitePages ??= [
  published(newWebsitePage(PETAL_AND_STEM_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c01", hoursAgo(2)), hoursAgo(2)),
  newWebsitePage(MAPLE_AND_RYE_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c02", hoursAgo(26)),
  newWebsitePage(LANTERN_CAFE_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c03", daysAgo(5)),
  published(newWebsitePage(NORTHPOINT_AUDIO_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c04", hoursAgo(3)), daysAgo(10)),
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

/** Images an owner uploaded from their computer. The mock backend keeps the bytes in memory. */
export type UploadedMedia = { websiteId: string; asset: MediaAsset; type: string; bytes: Uint8Array };

const uploads = globalThis as typeof globalThis & { __wbUploadedMedia?: UploadedMedia[] };
export const uploadedMedia: UploadedMedia[] = (uploads.__wbUploadedMedia ??= []);
