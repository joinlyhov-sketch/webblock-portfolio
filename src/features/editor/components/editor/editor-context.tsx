"use client";

import { createContext, use } from "react";
import type { MediaAsset } from "../../types";

/** The owner's image library, read by the page and handed to the image fields. */
export const MediaContext = createContext<MediaAsset[]>([]);

export function useMedia(): MediaAsset[] {
  return use(MediaContext);
}
