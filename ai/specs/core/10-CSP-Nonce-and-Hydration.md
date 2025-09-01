# CSP Nonce & Hydration — Deterministic SSR Pattern

Status: Approved

## Why This Matters
React hydration requires the server‑rendered HTML to exactly match the client’s initial render. A single attribute difference (such as a CSP nonce) forces a client re‑render and logs a hydration error. In medical apps, this is a hard “no” for production quality and stability.

## Goals
- One nonce per request, used consistently in both SSR HTML and the response CSP header.
- Zero render‑time variability (no `Date.now()`, `Math.random()`, or `typeof window` branches during render).
- Strict CSP (no `'unsafe-inline'`), relying on nonces.

## Implementation Pattern (Next.js App Router)

1) Generate nonce in `middleware.ts` once per request
- Use `crypto.randomUUID()`.
- Forward the nonce to SSR via REQUEST headers using `NextResponse.next({ request: { headers } })`.
- Build `Content-Security-Policy` with the same nonce: `script-src 'nonce-<nonce>'`, `style-src 'nonce-<nonce>'`.

2) Preserve auth cookies (Supabase)
- `updateSession()` must expose the cookies it intends to set (name, value, options) so middleware can re‑emit them on the final `NextResponse` after adding the forwarded request headers.
- Do not compute a separate nonce anywhere else.

3) Consume nonce in `app/layout.tsx`
- Read via `headers().get('x-nonce')`.
- Apply `nonce` to inline scripts that must run before hydration (e.g., theme init).
- Never render `nonce=""`; if absent, omit the attribute.

4) Deterministic SSR
- No `Date.now()`/`Math.random()`/locale formatting during render paths.
- No `typeof window` branches in render; use `useEffect` for client‑only behavior.

## Reference Skeleton
```ts
// middleware.ts
const nonce = crypto.randomUUID()
const requestHeaders = new Headers(request.headers)
requestHeaders.set('x-nonce', nonce)

const { response: sessionRes, setCookies } = await updateSession(request)

const res = NextResponse.next({ request: { headers: requestHeaders } })
for (const c of setCookies) res.cookies.set(c.name, c.value, c.options)
res.headers.set('Content-Security-Policy', buildCsp({ env, nonce }))
res.headers.set('x-nonce', nonce)
return res

// app/layout.tsx
const hdrs = await headers()
const nonce = hdrs.get('x-nonce') || undefined
<script nonce={nonce} dangerouslySetInnerHTML={{ __html: '/* deterministic init */' }} />
```

## Validation Checklist
- View source: inline scripts carry a populated nonce.
- Network tab: CSP `script-src` contains the same nonce; `x-nonce` header present.
- Console: no hydration warnings.
- Grep: no `Date.now()`/`Math.random()` or `typeof window` in render paths.

## Outcome
Stable hydration under strict CSP with a single, consistent nonce across middleware, SSR, and client.

