# PROTO — Supabase Changes for Prescription Security

Purpose: Ensure secure, RLS‑scoped access to prescriptions data and images, aligned with app patterns.

Applies to: Production Supabase project `hyufvcwzuaihmyohvwpv` (apply via `supabase/migrations`).

Owner: DB engineer

---

## Objectives

- Provide a patient‑scoped view for prescriptions: `v_patient__presc__prescriptions` (read via auth.uid()).
- Ensure storage bucket `prescription-images` is user‑scoped by path and protected by Storage RLS.
- Add essential indexes for common list sorting and filters.

---

## Migration Plan (Single SQL migration)

Create one migration file, e.g. `supabase/migrations/20250901_prescriptions_security.sql` with the following content.

```sql
-- 1) Patient-scoped prescriptions view
-- Base table is assumed to be public.patient__presc__prescriptions
-- Columns expected: prescription_id (uuid pk), user_id (uuid), image_path (text), status (text), 
-- prescription_date (date/timestamptz), analysis_data (jsonb), scan_quality_score (numeric/int), created_at, updated_at, is_active

create or replace view public.v_patient__presc__prescriptions as
select *
from public.patient__presc__prescriptions
where is_active = true and user_id = auth.uid();

-- 2) Useful indexes on base table
create index if not exists idx_presc_user_created on public.patient__presc__prescriptions(user_id, created_at desc);
create index if not exists idx_presc_status_created on public.patient__presc__prescriptions(status, created_at desc);
create index if not exists idx_presc_quality on public.patient__presc__prescriptions(scan_quality_score);

-- 3) Storage: Ensure bucket exists and Storage RLS is enabled
-- In Supabase, create bucket via dashboard or CLI if missing: `prescription-images`
-- Then add storage policies (SQL below). Paths are user-scoped: `${auth.uid()}/...`

-- a) Allow owners to upload into their own prefix
create policy if not exists storage_presc_upload_own
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'prescription-images'
  and (position(auth.uid()::text || '/' in path) = 1)
);

-- b) Allow owners to read their own images (needed for createSignedUrl)
create policy if not exists storage_presc_read_own
on storage.objects for select
to authenticated
using (
  bucket_id = 'prescription-images'
  and (position(auth.uid()::text || '/' in path) = 1)
);

-- c) Allow owners to update/delete their own objects (optional)
create policy if not exists storage_presc_modify_own
on storage.objects for update using (
  bucket_id = 'prescription-images'
  and (position(auth.uid()::text || '/' in path) = 1)
);

create policy if not exists storage_presc_delete_own
on storage.objects for delete using (
  bucket_id = 'prescription-images'
  and (position(auth.uid()::text || '/' in path) = 1)
);

-- 4) (Optional) A view over storage objects for admin auditing
-- create view public.v_storage_prescriptions as
-- select id, bucket_id, name, owner, created_at from storage.objects where bucket_id = 'prescription-images';
```

Notes:
- `createSignedUrl` in Supabase checks SELECT policy on storage.objects; policy (b) allows that for owner paths.
- The application already uploads to `${user.id}/${path}`; these policies align with that convention.

---

## Verification Checklist

1) View scoping
```sql
-- as user A
select count(*) from public.v_patient__presc__prescriptions; -- only A’s rows
```

2) Signed URL creation works for owner
```sql
-- via app or SQL test harness
-- Given an object at prescription-images/{auth.uid()}/foo.jpg
-- createSignedUrl should succeed as authenticated user
```

3) Cross‑user access denied
```sql
-- as user B
select * from storage.objects where bucket_id='prescription-images' and path like '<userA-id>/%'; -- denied by policy
```

4) Index usage
```sql
explain analyze select * from public.patient__presc__prescriptions where user_id = auth.uid() order by created_at desc limit 20;
```

---

## Acceptance Criteria

- SSR pages reading `v_patient__presc__prescriptions` load correctly and isolate data by user.
- Storage uploads under `${auth.uid()}/...` succeed; signed URL retrieval works for the owner and is denied for others.
- Query plans use the new indexes for list views and status filtering.

---

## Rollback Plan

- The migration is additive. If needed, drop the view and storage policies added above. Existing base table remains untouched.

