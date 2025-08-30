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
