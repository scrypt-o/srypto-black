# Security & Configuration — Revised

## Secrets
- Never commit `.env*`. Use `.env.local` for dev; `.env.test.local` for tests.
- No secrets in `public/`.

## Middleware & Headers
- Keep security headers/origin checks in `middleware.ts` updated cautiously.
- Public routes: `/login`, `/signup`, `/reset-password`; everything else requires auth.

## API Routes
- Validate body with Zod; return 422 with details.
- Return 400 for invalid/missing JSON.
- Verify CSRF on POST/PUT/DELETE.
- Enforce ownership on writes: `.eq('user_id', user.id)`.

### CSRF Configuration (REQUIRED)
```env
# .env.local - MANDATORY for development
NEXT_PUBLIC_SITE_URL=http://localhost:4569
CSRF_ALLOWED_ORIGINS=http://localhost:4569,https://qa.scrypto.online
```

### CSRF Implementation (lib/api-helpers.ts)
```ts
export function verifyCsrf(request: NextRequest): NextResponse | undefined {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return undefined

  const origin = request.headers.get('origin') || ''
  const referer = request.headers.get('referer') || ''

  // Build allowlist: env vars + current deployment origin
  const envOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.CSRF_ALLOWED_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean)

  const currentOrigin = request.nextUrl.origin
  const allowed = new Set([currentOrigin, ...envOrigins])

  let declaredOrigin = origin || (referer ? new URL(referer).origin : '')
  
  if (!declaredOrigin || !allowed.has(declaredOrigin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return undefined
}
```

## Database
- RLS enforced on views `v_*` for reads.
- Writes go to base tables; ensure policies match ownership.

## Client
- Do not expose tokens; rely on cookie-bound Supabase client.
- Never trust client input; server re-validates.

