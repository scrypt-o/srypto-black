# Authentication & Authorization — Revised

## Goals
- Protect all patient routes by default; allow only public auth flows.
- Keep auth checks server-side in pages; have API routes double-check auth.

## Server Pages
- Always start with `await requireUser()`.
- Use `getServerClient()` for reads; view names `v_*` enforce RLS by user.

## API Routes
- Call `getServerClient()` and `supabase.auth.getUser()`; return 401 if `!user`.
- Writes: verify CSRF via `verifyCsrf(request)` for POST/PUT/DELETE.
- Enforce ownership on writes: `.eq('user_id', user.id)`.

## Middleware (summary)
- Public: `/login`, `/signup`, `/reset-password`.
- All other pages require a session; redirect to `/login` if missing.

## Client Islands
- Use `getBrowserClient()` (already cookie-scoped).
- Never trust client input: server validates again with Zod in API routes.

## Example
```ts
// app/patient/medhist/allergies/[id]/page.tsx
await requireUser()
const supabase = await getServerClient()
const { data } = await supabase
  .from('v_patient__medhist__allergies')
  .select('*')
  .eq('allergy_id', id)
  .single()
```

