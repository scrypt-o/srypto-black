# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and API routes (`app/api/**/*`).
- `components/`: Reusable UI, layouts, patterns, and feature islands (PascalCase `.tsx`).
- `lib/`, `schemas/`, `types/`: Shared utilities, Zod schemas, and TypeScript types.
- `public/`: Static assets only; never store secrets.
- `__tests__/unit/`: Jest unit tests. Add folders as needed.
- `tests/e2e/`: Playwright end-to-end tests.
- `supabase/`: Local config, migrations, and `seed.sql`.

## Build, Test, and Development Commands
- `npm run dev`: Start dev server (PM2 helper chooses port).
- `npm run build`: Production build via Next.js.
- `npm start` or `npm run start:4569`: Serve built app (fixed port optional).
- `npm run lint`: ESLint (Next + TypeScript rules).
- `npm run typecheck` / `npm run check`: Type-only vs. type + lint.
- `npm test` | `npm run test:watch` | `npm run test:coverage`: Jest runs and coverage (≥ 80%).
- `npm run test:unit` | `npm run test:e2e` | `:ui` | `:headed`: Unit/E2E variants and inspector.

## Coding Style & Naming Conventions
- Language: TypeScript, React 19, Next.js 15, Tailwind CSS.
- Indentation: 2 spaces; Prettier defaults (via Next tooling).
- Files: components `PascalCase.tsx`; helpers `camelCase.ts`.
- Imports: use `@/*` path alias (see `tsconfig.json`).
- Linting: fix all warnings before PRs; adhere to React Hooks rules.

## Testing Guidelines
- Frameworks: Jest (`jest-environment-jsdom`), Testing Library; Playwright for E2E.
- Naming: `*.test.ts[x]` or `*.spec.ts[x]` near source or under tests dirs.
- Coverage: target ≥ 80% via `npm run test:coverage`.
- Quick runs: `npm test` (all), `npm run test:unit`, `npm run test:e2e`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Use imperative, concise scope.
- PRs: Include summary, linked issue, test plan, and screenshots for UI changes (store in `public/`).
- CI: Must pass `npm run check`, unit tests, and E2E (when applicable).

## Security & Configuration
- Secrets: Never commit `.env*`. Use `.env.local` for dev and `.env.test.local` for tests.
- API routes: Validate with Zod and respect auth in `app/api/**/*`.
- Middleware: Update security headers/origin checks in `middleware.ts` cautiously.
- Database: Apply changes via `supabase/migrations`; seed with `supabase/seed.sql`.

