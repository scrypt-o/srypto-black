# 03 — Layout Normalization: Standardize Page Wrappers

## Goal
Standardize patient pages to use `ListPageLayout`/`DetailPageLayout` wrappers for consistency with SSR-first architecture and shared UI behavior.

## Scope
- Convert remaining pages that use `PageShell` or bespoke shells to the standard layouts.
- Example target: `app/patient/medhist/allergies/page.tsx` (uses `PageShell`).

## Success Criteria (Measurable)
- [ ] All list pages under `app/patient/**/page.tsx` use `ListPageLayout`.
- [ ] All detail pages under `app/patient/**/[id]/page.tsx` use `DetailPageLayout`.
- [ ] No visual regressions in sticky headers/actions (manual spot check + screenshots for 3 representative pages).

## Tasks
1) Identify pages using `PageShell` (rg `import PageShell`), replace with `ListPageLayout`.
2) Ensure children remain a client view component (e.g., `AllergiesListFeature`).
3) Keep SSR data fetching unchanged; pass header/sidebar props to layout.
4) Repeat for detail pages with `DetailPageLayout`.

## Code Example — Allergies list

Before (`app/patient/medhist/allergies/page.tsx`):
```ts
import PageShell from '@/components/layouts/PageShell'
// ...
return (
  <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
    <AllergiesListFeature /* ... */ />
  </PageShell>
)
```

After:
```ts
import ListPageLayout from '@/components/layouts/ListPageLayout'
// ...
return (
  <ListPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
    <AllergiesListFeature /* ... */ />
  </ListPageLayout>
)
```

## Validation
- Build succeeds; navigate to updated pages and verify header, search bar, actions render correctly.
- Capture screenshots and store under `ai/testing/`.

## Timebox & Ownership
- Est. effort: 0.5 day.
- Owner: FE engineer.

