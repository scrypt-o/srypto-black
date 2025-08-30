# Server Actions vs API Routes — Decision

## Default
- Use Next API routes for writes (create/update/delete) to centralize validation, CSRF, and error semantics.

## When to Consider Server Actions
- Single-table mutations scoped to the current user.
- No need for CSRF (action executes server-side in response to a form submit).
- Clear benefit (reduced client code, simpler round-trip) without breaking established API contracts.

## Keep API Routes When
- Multi-table transactions or side effects.
- Stable, shareable endpoints are useful (mobile, other clients).
- You need consistent error payloads across clients.

## Rules
- One source of truth per mutation path (avoid duplicating logic across SA and API).
- Preserve error semantics: 422/400/401/403/404/500.
- Zod schemas remain the SSOT for inputs.

