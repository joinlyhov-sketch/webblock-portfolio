<!-- What: how page saves from the editor avoid overwriting someone else's changes. Status: accepted.
     Related: rules/editor-website-blocks.md, agents/editor-blocks-checker.md -->

# Decision 003: editor saves never overwrite silently

## Context
A website's pages can be edited from two tabs or by two people. Without protection, the last save
silently wipes the other person's changes.

## Decision
The backend stores each page as plain JSON with a revision number. Every save sends the revision the
editor loaded. If the page changed in the meantime, the backend answers `409 Conflict`.

## Consequences
- Block props must be plain JSON (no functions or class instances).
- On `409`, the editor shows the message and reloads the latest page — it never retries or overwrites.
