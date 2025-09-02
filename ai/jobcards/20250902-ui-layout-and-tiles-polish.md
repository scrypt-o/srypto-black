# Job Card — UI Layout & Tiles Polish (2025-09-02)

## Goals
- Clean, consistent chrome and content hierarchy (no header/content title duplication).
- Safer, opt-in visuals for lists and tiles that can be toggled and later persisted.
- Prepare for centralized UI prefs via Zustand.

## Scope
- Header/back/hamburger behavior
- Page shell usage alignment (List/Detail/Tile)
- List polish preview
- Tiles expressive + hero composition
- Settings page (prototype)

## Deliverables
- Specs: `ai/specs/core/12-UI-Rules-2025-09.md` (new) + update to `05-Layout-Components.md` (List polish).
- Settings page: `/patient/settings/ui` with client island.
- TileGrid: `expressive` + `composition` props; accent cycling.
- ListView: `previewPolish` prop; sticky offset.
- Shells: auto-select Patient/Pharmacy sidebar by route; header fixes.

## Plan
1. Header cleanup [done]
   - Replace absolute-centered title with in-flow.
   - Left slot: Back on nested; Hamburger (toggle/close) on top-level.
   - Remove user menu from header; keep notifications.
2. Shell alignment [done]
   - Auto-select sidebar (Patient/Pharmacy) in List/Detail/Page shells.
   - Keep PageShell as internal primitive.
3. List polish (opt-in) [done]
   - Add `previewPolish` prop + `?ui=polish` + localStorage fallback.
   - Correct sticky offset (`top-14 md:top-16`).
4. Tiles polish (opt-in) [done]
   - Add `expressive` + `composition` ('classic'|'hero'); `?tiles=...` overrides.
   - Accent cycling; brighter icon vs soft card tint; watermark.
5. Settings page (prototype) [done]
   - `/patient/settings/ui` with toggles; persist to localStorage.
   - Add Settings to Patient sidebar + home tile.
6. Profile consistency [next]
   - Convert `/patient/persinfo/profile` to `DetailViewLayout` sections with `formId`.
   - Wire sticky actions.
7. Page migrations [next]
   - Move remaining pages off `PageShell` to `ListPageLayout`/`DetailPageLayout`.
8. State consolidation [next]
   - Add UI prefs to `lib/stores/layout-store.ts` (Zustand), hydrate once.
   - Replace localStorage reads in views with store reads.
9. Hygiene [next]
   - Remove remaining inline SVGs (Auth LoginForm) → components/assets.

## Validation
- Manual: Navigate hubs with/without `?tiles=...`, lists with/without `?ui=polish`.
- Check header overlap eliminated; sticky bars offset correctly.
- A11y: visible focus rings; single H1; tab order unchanged.

## Rollback
- All visuals are opt-in via flags or user settings; disabling reverts to prior look.

