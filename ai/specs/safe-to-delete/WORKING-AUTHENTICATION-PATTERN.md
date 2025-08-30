# WORKING AUTHENTICATION PATTERN - Reference Implementation

**STATUS**: ✅ VERIFIED WORKING (2025-08-30)
**EVIDENCE**: Allergy edit/save functionality working end-to-end

## CRITICAL SUCCESS FACTORS

### 1. Environment Configuration (MANDATORY)
```env
# .env.local - ALL required for auth to work
NEXT_PUBLIC_SUPABASE_URL=https://hyufvcwzuaihmyohvwpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:4569
CSRF_ALLOWED_ORIGINS=http://localhost:4569,https://qa.scrypto.online
```

### 2. Server Client Implementation (lib/supabase-server.ts)
```typescript
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
            // CRITICAL: Single try-catch ONLY
            // Allows token refresh in API routes
            // Per official Supabase SSR documentation
          }
        },
      },
    }
  )
}
```

### 3. API Route Pattern (VERIFIED WORKING)
```typescript
// app/api/patient/medical-history/allergies/[id]/route.ts
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // CSRF check first
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    
    // Get authenticated client
    const supabase = await getServerClient()
    
    // Auth check - this now works due to corrected setAll function
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const { id } = await params
    const raw = (await request.json()) as unknown
    // ... validation logic ...
    
    // Database update with ownership enforcement
    const { data, error } = await supabase
      .from('patient__medhist__allergies')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('allergy_id', id)
      .eq('user_id', user.id)  // Ownership enforcement
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Allergy not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update allergy' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    // Error handling...
  }
}
```

### 4. CSRF Implementation (lib/api-helpers.ts)
```typescript
export function verifyCsrf(request: NextRequest): NextResponse | undefined {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return undefined

  const origin = request.headers.get('origin') || ''
  const referer = request.headers.get('referer') || ''

  // Build allowlist from environment + current origin
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

  let declaredOrigin = ''
  if (origin) {
    declaredOrigin = origin
  } else if (referer) {
    try {
      declaredOrigin = new URL(referer).origin
    } catch {
      declaredOrigin = ''
    }
  }

  if (!declaredOrigin || !allowed.has(declaredOrigin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return undefined
}
```

## WHAT WAS BROKEN & HOW IT WAS FIXED

### Original Issue
The `getServerClient()` had double try-catch blocks in `setAll()` that prevented Supabase from setting refreshed auth tokens in API routes:

```typescript
// BROKEN PATTERN (do not use)
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) => {
      try {  // ❌ DOUBLE TRY-CATCH BLOCKS TOKEN REFRESH
        cookieStore.set(name, value, options)
      } catch (_err) {
        // This blocked legitimate token refresh in API routes
      }
    })
  } catch (_outer) {
    // No-op
  }
}
```

### Root Cause
- User sessions would expire
- Middleware would refresh tokens correctly (different setAll implementation)
- API routes would try to refresh tokens but setAll would silently fail
- `auth.getUser()` would return null due to stale tokens
- Result: 401 Unauthorized errors

### Solution
Implemented official Supabase SSR pattern with single try-catch allowing legitimate cookie mutations during token refresh.

## TESTING VERIFICATION

### End-to-End Test Results ✅
1. **Login**: User can authenticate successfully
2. **Navigation**: Server pages load with auth protection
3. **Edit Mode**: Forms load with existing data
4. **Save Operation**: PUT request succeeds (200 OK)
5. **Data Persistence**: Updated values appear after page refresh
6. **Error Handling**: Proper UI feedback on success

### Console Evidence
```
Allergy updated successfully: {
  allergy_id: f231e7d3-0d59-400e-91a6-4f2b9015de9a, 
  user_id: db4f...
}
```

### Network Evidence
```
PUT /api/patient/medical-history/allergies/[id] => 200 OK
```

## COMPLIANCE CONFIRMATION

### Against Authentication & Authorization (Revised).md
- ✅ Line 8: Pages use `await requireUser()` 
- ✅ Line 12: API routes call `getServerClient()` and `auth.getUser()`
- ✅ Line 13: CSRF verification on writes
- ✅ Line 14: Ownership enforcement with `user_id`

### Against Security & Configuration (Revised).md  
- ✅ Line 14: CSRF verification implemented
- ✅ Line 15: Ownership enforcement in place
- ✅ Environment configuration documented

### Against API and Error Semantics (Revised).md
- ✅ Line 15: 401/403 auth errors properly handled
- ✅ Lines 27-29: Auth check pattern matches spec exactly

## THIS PATTERN MUST BE PRESERVED

Any future changes to authentication MUST maintain:
1. Single try-catch in setAll function (not double)
2. Required environment variables configuration  
3. CSRF verification on write operations
4. Ownership enforcement in database queries

**This implementation is VERIFIED WORKING and SPEC-COMPLIANT.**