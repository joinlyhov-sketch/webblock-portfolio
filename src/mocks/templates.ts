import type { Template } from "@/types/template";

export const templates: Template[] = [
  {
    id: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c01",
    name: "Everyday store",
    description: "Products, categories and clear prices",
    category: "CLOTHES",
    thumbnailUrl: "/mock/templates/everyday-store.png",
    badge: "Popular",
    previews: {
      desktop: { url: "/mock/templates/everyday-store-desktop.png", width: 1296, height: 3443 },
      tablet: { url: "/mock/templates/everyday-store-tablet.png", width: 738, height: 2660 },
      mobile: { url: "/mock/templates/everyday-store-mobile.png", width: 351, height: 3681 },
    },
  },
  {
    id: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c02",
    name: "Sweet pastel",
    description: "Round photos, stickers, candy colours",
    category: "FOOD_BEVERAGES",
    thumbnailUrl: "/mock/templates/sweet-pastel.png",
    previews: {
      desktop: { url: "/mock/templates/sweet-pastel-desktop.png", width: 1296, height: 3891 },
      tablet: { url: "/mock/templates/sweet-pastel-tablet.png", width: 738, height: 3201 },
      mobile: { url: "/mock/templates/sweet-pastel-mobile.png", width: 351, height: 3105 },
    },
  },
  {
    id: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c03",
    name: "Warm & bold",
    description: "Full-bleed hero, serif, menu-board grid",
    category: "FOOD_BEVERAGES",
    thumbnailUrl: "/mock/templates/warm-bold.png",
    previews: {
      desktop: { url: "/mock/templates/warm-bold-desktop.png", width: 1296, height: 3942 },
      tablet: { url: "/mock/templates/warm-bold-tablet.png", width: 738, height: 3157 },
      mobile: { url: "/mock/templates/warm-bold-mobile.png", width: 351, height: 3660 },
    },
  },
  {
    id: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c04",
    name: "Clean mono",
    description: "Hairlines, big type, catalogue layout",
    category: "TECHNOLOGY",
    thumbnailUrl: "/mock/templates/clean-mono.png",
    previews: {
      desktop: { url: "/mock/templates/clean-mono-desktop.png", width: 1277, height: 4090 },
      tablet: { url: "/mock/templates/clean-mono-tablet.png", width: 738, height: 3120 },
      mobile: { url: "/mock/templates/clean-mono-mobile.png", width: 351, height: 3436 },
    },
  },
];
