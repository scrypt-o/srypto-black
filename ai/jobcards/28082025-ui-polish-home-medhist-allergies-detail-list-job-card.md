# Job Card: UI Polish — Home, Medical History, Allergies (List + Detail), App Bar, Bottom Bar, Chat Dock

Date: 2025-08-28
Owner: Frontend
Status: Completed

## Context
- Prepare demo-ready UI by aligning home tiles, sidebar tinting, medical history tiles, list and detail patterns, and app bars (top/bottom).
- Allergies acts as the canonical list/detail implementation for future lists (50+ streams).

## Prime Decisions
- Server-first remains; no data model changes — purely UI/UX polish.
- Home keeps premium vertical tiles; other modules use grid tiles but with matching premium feel (accent, icon capsule, background tint).
- Sidebar adopts tile-aligned accent tints for active/hover states.
- Bottom app bar with 5 actions (Scan, Custom, Home, Search, AI) — Custom submenu includes “Daily deals”, “Find my loved ones”, “Vitality”.
- Chat dock opens via AI route (`/patient/chat`); removed floating launcher.
- Allergies list: emphasize readable title + severity; reduce clutter; smaller, lighter severity pills.
- Detail pages: view/edit parity — same layout; top-right actions; sticky action bar sits above bottom app bar.
- App header Back moves to far right and includes label “Back”.

## Tasks Executed
1) Tile systems
   - Added `status` line to tiles; configured Home status messages.
   - Grid tiles: accent tint layers, icon capsule, colored icons (match Home visuals).
   - Medical History: added Conditions, Immunizations, Surgeries, Family History tiles and scaffolded pages.

2) Sidebar + Header polish
   - Sidebar groups get color tints (light/dark) for hover/active; child links inherit group tint.
   - Header uses blue gradient; Back moved to far right with text.

3) Bottom app bar
   - 5 icons; colored per action; added small search modal and custom sliding sheet.
   - Custom items include icons and colored hover tints.

4) Chat dock
   - Docked panel with modes (top/bottom/full/min). Auto-opens on `/patient/chat`. Removed floating button.

5) List view framework
   - Shared `ListViewLayout` gains controls: thumbnails, avatar shape, density, chevron, rightColumns, export toggles, date format, title wrap, secondary line toggle, inline edit toggle, and tap feedback.
   - Allergies list configured for readable titles (wrap), comfortable spacing, minimal columns, smaller/lighter severity pills, no inline edit icon.

6) Detail view framework
   - `DetailViewLayout`: header actions in view/edit; sticky action bar offset above bottom bar; removed in-card back.
   - Allergies detail: view mode uses bordered blocks; edit toggles scroll-to-top.

## Outcomes
- Home tiles and sidebar visually cohesive; dark mode refined.
- Medical History grid matches Home style; tiles added with working routes.
- Mobile bottom bar present on tile/list/detail layouts with small colored icons.
- Chat opens from AI icon; dock supports top/bottom/full/min.
- Allergies list is readable and uncluttered; severity pills subtle; tap feedback added.
- Detail view resembles edit with clear boundaries and top actions; save bar never hides under app bar.

## Files Touched (high-level)
- Tiles: `components/layouts/TileGridLayout.tsx`, `components/layouts/VerticalTile.tsx`, `app/patient/config.ts`, `app/patient/medhist/page.tsx`, scaffolded medhist pages.
- Sidebar/Header: `components/layouts/PatientSidebar.tsx`, `components/layouts/AppHeader.tsx`.
- Bottom bar & custom sheet: `components/layouts/MobileFooter.tsx`.
- Chat dock: `components/patterns/ChatDock.tsx`, wired in layout clients.
- Lists: `components/layouts/ListViewLayout.tsx`, `components/features/patient/allergies/AllergiesListFeature.tsx`.
- Details: `components/layouts/DetailViewLayout.tsx`, `components/features/patient/allergies/AllergyDetailFeature.tsx`.
- Specs: updated ListView standards with new controls.

## Follow-ups
- Option flag to hide sticky bottom action bar (top-only actions) if desired.
- Add micro-badges on heading icons (counts) if needed.
- Expand grid tile accents per module (conditions teal, immunizations indigo, etc.).

## Verification
- Typecheck passes.
- Routes reachable: `/patient`, `/patient/medhist`, medhist child routes, `/patient/chat`.
- Visual checks in light/dark modes for header, sidebar, tiles, list, detail, and bottom bar.

