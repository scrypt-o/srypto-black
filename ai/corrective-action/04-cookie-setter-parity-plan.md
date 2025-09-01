# 04 — Cookie Setter Parity: Unify `setAll` Behavior

## Goal
Ensure consistent cookie mutation handling across server helpers to preserve token refresh behavior (no double try-catch and correct signature usage).

## Scope
- Files: `lib/supabase-server.ts`, `lib/supabase-api.ts`, any other server-side Supabase client helpers.

## Success Criteria (Measurable)
- [ ] All server helpers use `cookies.set(name, value, options)` signature inside a single try/catch.
- [ ] No differences in cookie API between files (no object `{ name, value, ...options }` passed to `.set`).
- [ ] Manual test: API route can refresh tokens without errors; authenticated API routes return 200 where expected.

## Tasks
1) Audit helpers
- Search for `setAll(` and `cookieStore.set(` usages and ensure consistent signature.

2) Update `lib/supabase-api.ts`
- Replace:
```ts
cookieStore.set({ name, value, ...options })
```
with:
```ts
cookieStore.set(name, value, options)
```
- Keep a single try/catch block around writes, matching `lib/supabase-server.ts`.

## Code Example — lib/supabase-api.ts
```ts
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) => {
      cookieStore.set(name, value, options)
    })
  } catch {
    // Ignore - called from Server Component
  }
}
```

## Validation
- Hit an authenticated API route after session expiry and verify refresh works (401→200 progression no longer flaps).

## Timebox & Ownership
- Est. effort: 30 minutes.
- Owner: FE/BE engineer.

