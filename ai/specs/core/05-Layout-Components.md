# Layout Shells & Prefetch — Revised

## Shells (Server)
- Server pages compose standard server layouts:
  - `ListPageLayout` for list pages
  - `DetailPageLayout` for detail pages
  - `TilePageLayout` for tile dashboards
- These layouts render client view components as children (`ListViewLayout`, `DetailViewLayout`, `TileGridLayout`).

## Patterns
- List: `ListPageLayout` + `ListViewLayout` with data and handlers.
- Detail: `DetailPageLayout` + `DetailViewLayout` with sections or children.
- Pass `headerTitle`, `sidebarItems`, and client view props from the server page.

## Prefetch & Navigation
- Prefer `<Link prefetch>` for all intra-app navigation from lists.
- Optionally prefetch common routes in client components on mount:
```ts
useEffect(() => {
  router.prefetch('/patient/medhist/allergies/new')
  initialData.slice(0, 5).forEach(r => router.prefetch(`/patient/medhist/allergies/${r.allergy_id}`))
}, [])
```

## A11y in Tables
- Set `aria-sort` on sortable headers (handled by `ListViewLayout`).
- Use clear labels and focus states in header actions.

## Do Nots
- No page-level `use client` in server pages.
- Do not double-fetch list data on first render; pass `initialData` from server.

---

## Update — 2025-09-01: ListView Polish Preview (Opt-in)

Purpose: Preview subtle visual refinements on list pages without changing templates or behavior. Fully reversible for design review.

Scope (visual only)
- Zebra rows, subtle card/border wrapper, enhanced focus ring.
- Stickier-looking header via light blur, no structure changes.

How it works
- `components/layouts/ListViewLayout.tsx` adds a prop: `previewPolish?: boolean` (default: `false`).
- `components/layouts/GenericListFeature.tsx` reads `?ui=polish` or `?previewPolish=1` and passes `previewPolish` to `ListViewLayout`.

Usage
- Any list route: append `?ui=polish` to preview the style (e.g., `/patient/medhist/allergies?ui=polish`).
- Remove the query param to revert instantly.

Guardrails
- Do not enable by default; keep opt-in during review.
- No changes to data flow, SSR, pagination, or actions.
- A11y preserved; focus states improved. No motion beyond subtle hover/press transitions.

Rollback
- Remove the query param or set `previewPolish={false}`; no code removal required.
