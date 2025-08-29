# Navigation & URL State — Revised

## Principles
- URL is the single source of truth for list state (page, search, filters, sort).
- Server pages parse `searchParams` with Zod and fetch accordingly.
- Client page/view components hydrate local store from initial props and keep URL in sync.

## Server Page
```ts
// app/patient/medhist/allergies/page.tsx
const PageSchema = z.object({ page: z.coerce.number().default(1), pageSize: z.coerce.number().default(20),
  search: z.string().optional(), allergen_type: z.string().optional(), severity: z.string().optional(),
  sort_by: z.enum(['created_at','allergen','severity','allergen_type']).optional(),
  sort_dir: z.enum(['asc','desc']).optional(),
})
const sp = PageSchema.parse({ /* from searchParams */ })
// Query `v_patient__medhist__allergies` using parsed values
```

## Client Component
```ts
// components/features/patient/allergies/AllergiesList.tsx
// 1) Hydrate store from initialState on mount
// 2) Effect: sync store → URL (router.replace) with debounce via startTransition
// 3) Use `<Link prefetch>` for list→detail and `addHref` for creation
```

## Prefetch
- Use `<Link prefetch>` in tables and actions.
- Imperative `router.prefetch()` only inside client components for common routes.

## Do Nots
- Do not double-fetch on first paint; use server-provided `initialData`.
- Do not store list state only in client; always mirror to URL.
