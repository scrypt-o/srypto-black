# Database Access & Conventions — Revised

## Views vs Tables
- Reads: use RLS-scoped views `v_*` (e.g., `v_patient__medhist__allergies`).
- Writes: mutate base tables (e.g., `patient__medhist__allergies`).

## RLS & Ownership
- All rows include `user_id`.
- API routes enforce `.eq('user_id', user.id)` on writes.

## Columns & Naming
- snake_case across DB, API, and UI (`allergen_type`, `first_observed`).
- Consistent enums in Zod and DB (`allergen_type`, `severity`).

## Pagination & Sorting
- Use `count: 'exact'` and `.range(from, to)` in list queries.
- Expose `sort_by`/`sort_dir` limited to safe columns.

## Indexing (notes)
- Add indexes for common filters/sorts: `(user_id, is_active, created_at desc)`, and pg_trgm on searchable text if needed.
- Track DB hardening as separate tasks; do not block SSR adoption.

## Seeding & Migrations
- Keep changes in `supabase/migrations`; sample data in `supabase/seed.sql`.

