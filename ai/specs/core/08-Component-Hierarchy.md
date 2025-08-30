# Naming & Component Taxonomy — Revised

## Page-Level Layouts (Server)
- `ListPageLayout`: Server wrapper for list pages (composes header/sidebar and `ListViewLayout`).
- `DetailPageLayout`: Server wrapper for detail pages (composes header/sidebar and `DetailViewLayout`).
- `TilePageLayout`: Server wrapper for tile dashboards (composes `TileGridLayout`).

## View Components (Client)
- `ListViewLayout`: Base list table with search, filters, sort, pagination, selection, actions.
- `DetailViewLayout`: Base detail form/view with sections, mode switching, action bar.
- `TileGridLayout`: Grid of tiles/cards for module hubs.

## Feature Components (Client)
- Feature-specific client components render inside the server layouts using the base view components.
- Example names: `AllergiesList`, `AllergyDetail`, `AllergyCreate` (no “island/chrome” terminology).

## API & Schemas
- API route files under `app/api/...`; Zod schemas under `schemas/` with snake_case keys.

## Navigation & Prefetch
- Use `<Link prefetch>` for intra-app navigations; limited imperative prefetch inside client components.

