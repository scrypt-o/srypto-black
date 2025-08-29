# Security & Configuration — Revised

## Secrets
- Never commit `.env*`. Use `.env.local` for dev; `.env.test.local` for tests.
- No secrets in `public/`.

## Middleware & Headers
- Keep security headers/origin checks in `middleware.ts` updated cautiously.
- Public routes: `/login`, `/signup`, `/reset-password`; everything else requires auth.

## API Routes
- Validate body with Zod; return 422 with details.
- Return 400 for invalid/missing JSON.
- Verify CSRF on POST/PUT/DELETE.
- Enforce ownership on writes: `.eq('user_id', user.id)`.

## Database
- RLS enforced on views `v_*` for reads.
- Writes go to base tables; ensure policies match ownership.

## Client
- Do not expose tokens; rely on cookie-bound Supabase client.
- Never trust client input; server re-validates.

