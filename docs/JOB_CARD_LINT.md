# Job Card — Linting: Resolution and Policy

- Owner: AI assistant (Codex CLI)
- Date: 2025-09-01
- Scope: ESLint setup, decisions, and how we enforce quality

## Summary
- Root cause: Mixed legacy + flat configs and Rushstack patch crash prevented lint from running.
- Resolution: Standardized on ESLint flat config and removed legacy config; avoided the Rushstack patch.
- Current state: `npm run lint` runs successfully; errors fail CI locally, warnings are reported.

## Current Setup
- Runner: `eslint .` via `npm run lint` (no Next wrapper).
- Config: `eslint.config.mjs` (flat) with:
  - Plugins: `@next/eslint-plugin-next`, `@typescript-eslint/*`, `react`, `react-hooks`, and local `tools/eslint-plugin-scrypto`.
  - Ignores: `.next`, `node_modules`, `dist`, `build`, `coverage`, `playwright-report`, `test-results`, `logs`.
  - Enforcement: Critical rules are errors (security, React hooks, key Next rules, Scrypto rules). Type-safety rules are warnings except in hot paths.

## Enforcement Policy
- Errors: Block merges/builds.
  - Examples: `no-eval`, `no-debugger`, `react-hooks/rules-of-hooks`, `@next/next/no-sync-scripts`, custom Scrypto rules, etc.
- Warnings: Visible, do not block.
  - Examples: `@typescript-eslint/no-unsafe-*`, `no-console` (except allowed in API routes), `prefer-const`.
- Tests: Less strict to maintain velocity.
  - `*.{test,spec}.ts(x)`: `no-explicit-any` is off; other unsafe rules remain warn.

## Performance
- Avoid timeouts by not scanning artifacts (see ignores above).
- Optional speed-ups locally: `eslint . --cache --cache-location .cache/eslint/`.

## How to Run
- Local dev: `npm run lint` (warnings allowed).
- Type checking: `npm run typecheck`.
- Combined check: `npm run check` (typecheck + lint).

## CI Guidance
- Near-term: Keep `npm run check` as the gate; allow warnings to pass.
- Later (once warnings trend down): add a CI-only lint variant with `--max-warnings=0`.
  - Example: `eslint . --max-warnings=0 --cache --cache-location .cache/eslint/`.
  - Or scope to gates: `{app,components,lib,schemas,types}/**/*.{ts,tsx,js,jsx}`.

## Notes
- We did not "bypass" lint or TypeScript: we standardized the config to make it stable and enforce critical rules reliably.
- If warning volume becomes noisy, we can target specific directories or rules with overrides rather than turning whole categories off.

