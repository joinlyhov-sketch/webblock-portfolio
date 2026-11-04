import type { AppState, Config } from "@puckeditor/core";
import { addBlockProblem } from "../../block-limits";
import type { BlockName, BlockProps, SiteRootProps } from "../../types";
import { puckConfig } from "../puck-config";
import { applyFieldRules } from "./field-rules";

type EditorConfig = Config<BlockProps, SiteRootProps>;

/**
 * The canvas's own Duplicate button follows the block limits too. Puck only re-runs this when a block's
 * props change, so the structure panel calls `refreshPermissions()` whenever the page's blocks change.
 */
function withLimits<K extends BlockName>(name: K, component: EditorConfig["components"][K]) {
  return {
    ...component,
    resolvePermissions: (_data: unknown, { appState }: { appState: AppState }) => ({
      duplicate: addBlockProblem(appState.data.content, name) === null,
    }),
  };
}

function applyBlockLimits(config: EditorConfig): EditorConfig {
  const c = config.components;
  return {
    ...config,
    components: {
      Hero: withLimits("Hero", c.Hero),
      Text: withLimits("Text", c.Text),
      ProductCards: withLimits("ProductCards", c.ProductCards),
      AllProducts: withLimits("AllProducts", c.AllProducts),
      About: withLimits("About", c.About),
      VisitUs: withLimits("VisitUs", c.VisitUs),
      // The Footer can't be dragged on the canvas: it always stays the last block.
      Footer: { ...withLimits("Footer", c.Footer), permissions: { ...c.Footer.permissions, drag: false } },
    },
  };
}

/** The Puck config for the editor only: the shared config plus the save/deploy limits on every field. */
export const editorConfig = applyBlockLimits(applyFieldRules(puckConfig));
