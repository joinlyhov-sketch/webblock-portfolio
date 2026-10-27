import type { TemplateKey } from "../../../types";
import { cleanMono } from "./clean-mono";
import { everydayStore } from "./everyday-store";
import { sweetPastel } from "./sweet-pastel";
import type { TemplateDesign } from "./types";
import { warmBold } from "./warm-bold";

/** Template key (stored in the page root props) → its block designs. */
export const templateDesigns = {
  "everyday-store": everydayStore,
  "sweet-pastel": sweetPastel,
  "warm-bold": warmBold,
  "clean-mono": cleanMono,
} satisfies Record<TemplateKey, TemplateDesign>;
