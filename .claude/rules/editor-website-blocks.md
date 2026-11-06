---
paths:
  - "src/features/editor/**"
---
<!-- What: the fixed set of website blocks in the Puck editor and how page saves must behave.
     Loads: when editing src/features/editor. Checked by: agents/editor-blocks-checker.md -->

# Editor: website blocks

The website editor (Puck) uses a fixed set of blocks, registered in
`components/puck-config.tsx` (limits in `components/editor/editor-config.ts`):

| Block | Shows |
|---|---|
| `Hero` | headline, subtitle, background image, contact CTAs (`tel:`, `mailto:`) |
| `Text` | heading and body copy, 1–3 columns |
| `ProductCards` | display-only product grid: image, name, category, decimal price |
| `AllProducts` | the full catalogue (display-only): search box, categories, products per page, columns |
| `About` | story, image(s), optional caption and up to 3 numbers ("10+ years open") |
| `VisitUs` | heading for the visit section (address, hours and the Google Maps link come from the business info) |
| `Footer` | copyright, links, contact details (always the last block, can't be dragged) |

- Adding or renaming a block type needs team agreement; update this table in the same change.
- Puck is imported only inside `src/features/editor` (enforced by `hooks/check-project-rules.mjs`).
- Block props are plain JSON (no functions, JSX, class instances or `Date`): the backend stores the page as JSON.
- CTAs follow `business-websites-showcase-only.md`.
- **Saving pages:** send the revision the backend gave us. A `409 Conflict` means someone else saved
  first: show the message and reload — never overwrite.
