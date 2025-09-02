# Repository Guidelines

This guide helps contributors work consistently in this Next.js App Router project.

## Project Structure & Module Organization
- `app/`: Next.js pages, layouts, and API routes (`app/api/**/*`).
- `components/`: Reusable UI, layouts, patterns, feature islands (PascalCase `.tsx`).
- `lib/`, `schemas/`, `types/`: Shared utilities, Zod schemas, and TypeScript types.
- `public/`: Static assets only; never store secrets.
- `__tests__/unit/`: Jest unit tests (add folders as needed).
- `tests/e2e/`: Playwright end-to-end tests.
- `supabase/`: Local config, migrations, and `seed.sql`.

## Build, Test, and Development Commands
- `npm run dev`: Start dev server (PM2 helper chooses port).
- `npm run build`: Production build via Next.js.
- `npm start` | `npm run start:4569`: Serve built app (fixed port optional).
- `npm run lint`: ESLint with Next + TypeScript rules.
- `npm run typecheck` / `npm run check`: Type-only vs. type + lint.
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Jest runs; target ≥ 80% coverage.
- `npm run test:unit` | `npm run test:e2e` (`:ui`, `:headed`): Unit/E2E variants and inspector.

## Coding Style & Naming Conventions
- **Language/Stack**: TypeScript, React 19, Next.js 15, Tailwind CSS.
- **Formatting**: 2-space indentation; Prettier via Next tooling.
- **Files**: components `PascalCase.tsx`; helpers `camelCase.ts`.
- **Imports**: use `@/*` path alias (see `tsconfig.json`).
- **Linting**: Fix all warnings; follow React Hooks rules.

## Testing Guidelines
- **Frameworks**: Jest (`jest-environment-jsdom`) + Testing Library; Playwright for E2E.
- **Naming**: `*.test.ts[x]` or `*.spec.ts[x]` near source or under tests dirs.
- **Coverage**: Maintain ≥ 80% via `npm run test:coverage`.
- **Quick runs**: `npm run test:unit` for units; `npm run test:e2e` for flows.

## Commit & Pull Request Guidelines
- **Commits**: Conventional Commits (e.g., `feat(ui): add modal`). Keep messages imperative and scoped.
- **PRs**: Include summary, linked issue, test plan, and screenshots for UI changes (store in `public/`).
- **CI**: PRs must pass `npm run check`, unit tests, and E2E (when applicable).

## Security & Configuration
- **Secrets**: Never commit `.env*`. Use `.env.local` (dev) and `.env.test.local` (tests).
- **API routes**: Validate with Zod and respect auth in `app/api/**/*`.
- **Middleware**: Update security headers/origin checks in `middleware.ts` cautiously.
- **Database**: Apply changes via `supabase/migrations`; seed with `supabase/seed.sql`.

