# Repository Guidelines

## Project Structure & Module Organization
- `app/`: App Router pages, layouts, and API (`app/api/**/*`).
- `components/`: Reusable UI islands in `PascalCase.tsx`.
- `lib/`, `schemas/`, `types/`: Utilities, Zod schemas, shared types.
- `__tests__/unit/`, `tests/e2e/`: Jest unit tests and Playwright flows.
- `supabase/`: Local config, migrations, and `seed.sql`.
- `ai/specs`, `ai/jobcards`: Required specs and immutable job cards.
- `ai/testing/`: Playwright evidence; name screenshots like `YYYYMMDD-view.png`.

## Build, Test, and Development Commands
- `npm run dev`: Start via PM2 on port 4569 for local dev.
- `npm run build` → `npm run start:4569`: Production build and serve on fixed port.
- `npm run lint` / `npm run typecheck` / `npm run check`: Lint, type-check, or both.
- `npm test` / `npm run test:unit` / `npm run test:e2e`: Run all, unit, or E2E tests.
- `npm run test:coverage`: Enforce ≥ 80% coverage.

## Coding Style & Naming Conventions
- 2-space indentation; Prettier via Next.js tooling.
- Components `PascalCase.tsx`; helpers `camelCase.ts`.
- Use `@/*` path alias for imports.
- Fix all ESLint warnings; follow React Hooks rules.
- Domain naming: `{domain}__{group}__{item}` (e.g., `patient__medhist__allergies`).

## Testing Guidelines
- Unit: Jest (`jest-environment-jsdom`) + Testing Library.
- E2E: Playwright; store screenshots in `ai/testing/`.
- Name tests `*.test.ts[x]` or `*.spec.ts[x]`; keep near source or in test dirs.
- Aim for fast, deterministic tests; maintain ≥ 80% coverage.

## Commit & Pull Request Guidelines
- Conventional Commits (e.g., `feat(ui): add modal`).
- PRs include: summary, linked issue, test plan, and UI screenshots (`public/` or `ai/testing/`).
- CI must pass `npm run check`, unit tests, and E2E as applicable.

## Security & Architecture
- Never commit `.env*`; use `.env.local` and `.env.test.local`.
- Auth enforced via `middleware.ts`; avoid page-level auth checks.
- Database changes via `supabase/migrations`; prefer reads via views where defined.

## Agent Rules
- No work without a spec (`ai/specs`). If unclear, halt and ask.
- Job cards are append-only (`ai/jobcards`).
- Prefer SSR-first with TanStack Query; validate with E2E evidence.

