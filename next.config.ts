import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Profile photo and logo uploads go through Server Actions (up to 5 MB + form overhead).
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
