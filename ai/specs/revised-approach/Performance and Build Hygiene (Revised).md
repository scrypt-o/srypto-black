# Performance & Build Hygiene — Revised

## Server-First
- Remove page-level `use client`; keep shells server-rendered.
- Avoid double-fetch: pass `initialData` and hydrate client components.

## Navigation
- Use `<Link prefetch>`; prefetch common routes in client components sparingly.
- Debounce URL updates; prefer `startTransition` for search/filter/sort.

## Rendering
- Keep client bundles lean (no heavy libs in base layouts).
- Ensure no hydration warnings; align server/ client props carefully.

## Build
- `npm run build` then `npm start` (or `npm run start:4569`).
- Enable compression at the process manager/proxy layer.

## Query Efficiency
- Use `count: 'exact'` only where needed (lists).
- Add necessary DB indexes separately; don’t block SSR adoption.

## Monitoring
- Keep console clean in production; gate debug logs behind NODE_ENV.
