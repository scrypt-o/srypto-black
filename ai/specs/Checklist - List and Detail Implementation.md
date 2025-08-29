# Checklist — List and Detail Implementation (No-Nuance, Step-by-Step)

Follow this exactly to implement and test ANY list + detail view in this app.

## Prerequisites
- Names: `{domain}__{group}__{item}` (DB table), `v_{domain}__{group}__{item}` (read view).
- Paths: `app/{domain-readable}/{group-readable}/{item}`, `app/api/{domain-readable}/{group-readable}/{item}`.
- Auth: valid session in `cookies.txt` (Netscape).
- CSRF: same-origin `Origin` and `Referer` for POST/PUT/DELETE.

## 1) Schemas
- File: `schemas/{item}.ts`
- Include:
  - Row schema: mirrors DB table (nullable as DB; timestamps as strings).
  - Enums: export DB enums (`z.enum([...])`).
  - Create/Update input schemas: strings trimmed on server; optional fields `optional()`.
  - ListQuery schema: `{ page, pageSize ≤ 100, search?, filters? }`.
  - ListResponse schema: `{ data: Row[]; total; page; pageSize }`.

## 2) API Routes
- Files:
  - List/Create: `app/api/{domain}/{group}/{item}/route.ts`
  - Get/Update/Delete: `app/api/{domain}/{group}/{item}/[id]/route.ts`
- Rules:
  - Auth first: `const { user } = await supabase.auth.getUser(); if (!user) 401`.
  - CSRF: `verifyCsrf(request)` for non-GET → 403 if present.
  - Read from view: `from('v_{...}')` only.
  - Write to table: `from('{...}')` for inserts/updates; soft delete `is_active=false`.
  - Trim inputs; Zod-validate; 422 with `{ error, details }` on parse fail.
  - Status codes: 200(GET/PUT/DELETE), 201(POST), 401, 403, 404(PostgREST no rows), 422, 500.

## 3) Hooks
- File: `hooks/use{ItemPlural}.ts`
- Keys: `{ all, list(params), detail(id) }`.
- Queries: `useQuery(Keys..., () => fetch('/api/...').json())`.
- Mutations: `useMutation` (`useCreate`, `useUpdate`, `useDelete`).
  - On success: `invalidateQueries(['{item}'])` and detail when applicable.
  - Non-2xx: `throw await ApiError.fromResponse(res)`.

## 4) SSR Pages
- Files:
  - List: `app/{domain}/{group}/{item}/page.tsx` (server).
  - New: `app/{domain}/{group}/{item}/new/page.tsx` (server → client feature mount).
  - Detail: `app/{domain}/{group}/{item}/[id]/page.tsx` (server).
- Steps:
  - `await requireUser()`.
  - Parse `searchParams` with Zod.
  - Server-fetch from view with filters/sort/pagination.
  - Render server layout + mount client feature with `{ initialData, total, initialState }`.

## 5) List Feature (Client)
- File: `components/features/{domain}/{item}/{ItemPlural}ListFeature.tsx`.
- Use `ListViewLayout` with defaults:
  - `density="comfortable"`, `titleWrap="wrap"`, `showSecondaryLine={false}`, `showInlineEdit={false}`, `showChevron`.
  - Map `{ initialData → { id, title, severity, thirdColumn?, data } }`.
  - Row click → detail via router.
  - Search/filter → update URL params; do NOT fetch on first paint.
  - If needed, set `rightColumns`, `getThumbnail`.

## 6) Detail Feature (Client)
- File: `components/features/{domain}/{item}/{Item}DetailFeature.tsx`.
- View/Edit parity: identical layout; view uses bordered value blocks.
- Use `DetailViewLayout`:
  - Top-right: View → Edit/Delete; Edit → Save/Cancel.
  - Sticky action bar (already offset above bottom app bar on mobile).
  - On Edit, scroll-to-top for context.
  - Mutations via hooks; refresh or route on success.

## 7) Navigation
- Add tile or nav entry if applicable (module hub or sidebar file).
- Prefer `<Link prefetch>`; list row uses SPA navigation.

## 8) Tests — Add Exactly These
- Zod (Unit): `__tests__/unit/schemas/{item}.schema.test.ts` — create/update/list parse positive/negative.
- API (Unit): `__tests__/unit/api/{item}.api.test.js`, `{item}.auth.test.js`, `{item}.notfound.test.js`.
  - Cover: 201, 200, 422, 401, 403 (mock CSRF), 404 (PostgREST no rows). Optionally mock 500.
- Hooks (Unit): `__tests__/unit/hooks/use{ItemPlural}.test.tsx`.
  - Success → invalidates `['{item}']` (and detail); non-2xx → throws ApiError.
- API E2E (Live): `__tests__/api/{item}.e2e.test.js`.
  - Use cookies.txt; set `Origin`/`Referer`; flow: Create(201) → Update(200) → Delete(200).
  - Run: `BASE_URL="http://localhost:4569" npm run test:api -- __tests__/api/{item}.e2e.test.js`.
- UI E2E (Playwright): `tests/e2e/{item}.spec.ts`.
  - Config: `playwright.config.ts` (baseURL env; `tests/e2e/global-setup.ts` builds storageState from cookies.txt).
  - Flow: List → New → Save → List → Detail → Edit → Save.
  - Assert: wrapped title, small severity pill, row tap feedback, top-right actions, sticky save bar above bottom bar.

## 9) Commands
- Unit: `npm run test:unit`
- Coverage: `npm run test:coverage`
- Live API E2E: `BASE_URL="http://localhost:4569" npm run test:api -- __tests__/api/{item}.e2e.test.js`
- UI E2E: `BASE_URL="http://localhost:4569" npm run test:e2e`

## 10) Acceptance Criteria
- API: 201/200/401/403/404/422/500 paths covered; reads via view; writes via table; soft delete.
- Schemas: valid accepted; invalid rejected.
- Hooks: invalidate on success; throw on errors.
- UI: readable list (wrapped titles, subtle severity pill, row feedback); view/edit parity; sticky save above bottom bar; no hydration warnings; clean console.
- Tests: all pass locally; E2E succeeds with cookies.txt and same-origin headers.
