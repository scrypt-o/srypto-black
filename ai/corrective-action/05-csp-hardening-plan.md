# 05 — CSP Hardening (Production)

## Goal
Strengthen Content-Security-Policy for production to reduce XSS risk while preserving current dev experience.

## Scope
- Update `middleware.ts` or introduce env-based CSP builder.
- Keep `'unsafe-inline' 'unsafe-eval'` in development only; remove in production.

## Success Criteria (Measurable)
- [ ] Dev behavior unchanged.
- [ ] Production CSP removes `'unsafe-inline'` and `'unsafe-eval'` and uses nonces for inline scripts.
- [ ] No console CSP violations on main pages in prod-like run.

## Tasks
1) Add CSP builder
- Create `lib/security/csp.ts` with function `buildCsp({ env, nonce })` returning a strict policy for prod.

2) Wire middleware
- In `middleware.ts`, compute nonce and set CSP based on `process.env.NODE_ENV` or `NEXT_PUBLIC_ENV`.

3) Nonce usage (optional, incremental)
- Add nonce to critical inline scripts (e.g., theme boot script in `app/layout.tsx`).

## Code Example — lib/security/csp.ts
```ts
export function buildCsp({ env, nonce }: { env: 'development' | 'production'; nonce?: string }) {
  if (env === 'development') {
    return [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ')
  }
  return [
    "default-src 'self'",
    "img-src 'self' data:",
    "style-src 'self' 'self'",
    `script-src 'self' 'nonce-${nonce ?? ''}'`,
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}
```

## Validation
- Run prod build locally and verify no CSP violations on navigation.

## Timebox & Ownership
- Est. effort: 0.5 day (with nonce plumbing).
- Owner: FE engineer.

