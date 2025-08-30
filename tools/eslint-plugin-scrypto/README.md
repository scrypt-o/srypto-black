Scrypto ESLint Plugin (Local)

Rules included:

- scrypto/no-requireUser-in-pages: Disallow `requireUser()` usage/imports in `app/patient/**/page.tsx`.
- scrypto/server-reads-from-views: Ensure `supabase.from('v_*')` is used in `app/**/page.tsx` when reading.
- scrypto/api-route-requires-csrf: Require `verifyCsrf(request)` in non-GET API handlers in `app/api/**/route.ts`.
- scrypto/api-route-requires-auth: Require a `supabase.auth.getUser()` call in non-GET API handlers in `app/api/**/route.ts`.

Usage (flat config):

- Place `eslint.config.mjs` at the app root (done) and run ESLint with flat config support, e.g.:
  - `npx eslint .` (ESLint 9+) or `ESLINT_USE_FLAT_CONFIG=true npx eslint .` (ESLint 8).

