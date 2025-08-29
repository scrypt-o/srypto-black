# Testing & CI — Revised

## Goals
- High confidence with fast feedback. Unit for logic, integration for islands, E2E for critical flows.

## Commands
- Unit: `npm run test:unit` (Jest, jsdom).
- All + coverage: `npm run test:coverage` (≥ 80%).
- E2E: `npm run test:e2e` | `:ui` | `:headed` (Playwright).

## Unit Patterns
- Test Zod schemas (happy + invalid cases).
- Test list store utilities and URL sync helpers.
- Test API route handlers with mocked Supabase client and request objects.

## Integration (Client Islands)
- Render islands with initial props; assert URL sync on search/sort/filter.
- Mock `fetch` for mutation success/error paths; assert toasts and refresh/navigation.

## E2E (Critical Paths)
- Allergies list → detail → edit → save → back.
- Create allergy flow; deletion (soft delete).
- Auth gate: redirect to login when not authenticated.

## Environments
- Use `.env.test.local` (never commit secrets).
- Seed minimal data in `supabase/seed.sql` or test fixtures.

## CI Gates
- `npm run check` (type + lint), unit tests, and E2E (when applicable) must pass.

