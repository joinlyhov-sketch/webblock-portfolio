<!-- What: how to add or change a block in the website editor safely.
     Related: rules/editor-website-blocks.md, agents/editor-blocks-checker.md -->

# How to add or change an editor block

Everything lives in `src/features/editor` (Puck may not be imported anywhere else).

1. Agree with the team first: the block list in `.claude/rules/editor-website-blocks.md` is fixed.
   Update that table in the same change.
2. Props are plain JSON: no functions, JSX or class instances in the stored page.
3. CTAs only go to `tel:`, `mailto:`, Google Maps directions or an external `https://` link —
   no cart, order or booking actions.
4. Register the block in `components/puck-config.tsx` (limits in `components/editor/editor-config.ts`)
   with explicit field definitions, and add its render to every template in `components/site/templates/`.
5. Run the `editor-blocks-checker` agent, then `/check-project`.
