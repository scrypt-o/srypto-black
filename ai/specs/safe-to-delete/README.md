# Revised Approach — Index & Principles

**READ CORE SPECS ONLY** - Everything else is archived or implementation-specific.

## Core Specs (ai/specs/core/)
**Read these 7 specs in order to build any Scrypto stream:**

1. **01-Authentication.md** - Middleware protection, CSRF, environment
2. **02-API-Patterns.md** - Status codes, error handling, patterns
3. **03-Database-Access.md** - Views, tables, RLS, ownership  
4. **04-Zod-Validation.md** - Schemas, validation patterns
5. **05-Layout-Components.md** - Page layouts, component hierarchy
6. **06-SSR-Architecture.md** - Server components, client islands
7. **07-Navigation-URL-State.md** - Routing, search params, state

## Reference Materials  
- **database-ddl/** - Database schemas for each stream
- **ALLERGIES-END-TO-END-AUDIT.md** - Working implementation example

## Implementation Specs
- **implementation/** - Branch-specific implementation guides (do not modify)

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
