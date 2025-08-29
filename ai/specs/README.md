# Revised Approach — Index & Principles

This folder is the vetted, canonical spec set for the SSR‑first Scrypto app. Use these documents as the single source of truth. Allergies is the reference module.

## Core Order (read in sequence)
1. SSR‑First Architecture.md
2. Authentication and Authorization (Revised).md
3. Navigation and URL State (Revised).md
4. Layout Shells and Prefetch (Revised).md
5. ListView and DetailView Standards.md
6. Zod Validation (Revised).md
7. API and Error Semantics (Revised).md
8. Complete CRUD - Allergies (Revised).md
9. Accessibility and UX Checklist (Revised).md
10. Database Access and Conventions (Revised).md
11. State and Caching (Revised).md
12. Performance and Build Hygiene (Revised).md
13. Testing and CI (Revised).md
14. Security and Configuration (Revised).md

## Non‑negotiables
- Server‑first pages and shells; no “islands/chrome” nomenclature.
- Standard components only: `ListPageLayout`, `DetailPageLayout`, `TilePageLayout` (server) compose `ListViewLayout`, `DetailViewLayout`, `TileGridLayout` (client).
- Reads from RLS‑scoped views `v_*`; writes via API routes to base tables.
- URL is source of truth for list state; hydrate store from URL.
- `<Link prefetch>` by default; limit imperative prefetch to islands.
- Error semantics: 422 validation, 400 bad JSON, 401/403 auth, 404 not found, 500 unexpected.
- Inputs: trim server‑side; empty strings → `undefined` for optional fields.
- A11y: form labels, aria‑sort on sortable headers, clear empty/error states.

## Canonical Example
- Module: app/patient/medhist/allergies/*
- Islands: components/features/patient/allergies/*
- API: app/api/patient/medical-history/allergies/*
- Schemas: schemas/allergies.ts
