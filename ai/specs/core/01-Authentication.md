# Authentication & Authorization — Revised

## Goals
- Protect all patient routes by default; allow only public auth flows.
- Keep auth checks server-side in pages; have API routes double-check auth.

## Server Pages
- Auth protection handled by middleware for `/patient/*` routes.
- Use `getServerClient()` for reads; view names `v_*` enforce RLS by user.
- `await requireUser()` is optional when middleware already protects routes.

## API Routes
- Call `getServerClient()` and `supabase.auth.getUser()`; return 401 if `!user`.
- Writes: verify CSRF via `verifyCsrf(request)` for POST/PUT/DELETE.
- Enforce ownership on writes: `.eq('user_id', user.id)`.

## Middleware (summary)
- Public: `/login`, `/signup`, `/reset-password`.
- All other pages require a session; redirect to `/login` if missing.

## Client Islands
- Use `getBrowserClient()` (already cookie-scoped).
- Never trust client input: server validates again with Zod in API routes.

## Working Implementation Reference

### Server Client Setup (lib/supabase-server.ts)
```ts
export async function getServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### Server Page Pattern (Our Implementation)
```ts
// app/patient/medhist/allergies/[id]/page.tsx
// No requireUser() needed - middleware protects /patient/* routes
const supabase = await getServerClient()
const { data } = await supabase
  .from('v_patient__medhist__allergies')
  .select('*')
  .eq('allergy_id', id)
  .single()
```

### API Route Pattern
```ts
// app/api/patient/medical-history/allergies/[id]/route.ts
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const csrf = verifyCsrf(request)
  if (csrf) return csrf
  
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Continue with validated user...
}
```

### Environment Configuration Required
```env
# .env.local - MANDATORY for auth to work
NEXT_PUBLIC_SUPABASE_URL=https://hyufvcwzuaihmyohvwpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

**CRITICAL**: The setAll function must NOT have double try-catch blocks as this prevents token refresh in API routes.

