# State & Caching — Revised

## List State
- Use a small store slice per entity (e.g., `createListSlice('allergies')`).
- Hydrate from server-provided `initialState` on mount.
- Sync store → URL with debounce via `startTransition`.

## Query Runtime
- `useQuery`, `useMutation`, `invalidateQueries` from `@/lib/query/runtime`.
- Keying: namespace by entity (e.g., `['allergies', 'list', params]`).
- Invalidate broad keys on writes (e.g., `['allergies']`) and specific detail keys when known.

## Optimistic Updates
- Keep client components responsive with local state updates.
- Roll back on error and show toasts via `useToast()`.

## Avoid
- Global stores for server-fetched data; the server is the source of truth.
- Double-fetching list data on first render.
