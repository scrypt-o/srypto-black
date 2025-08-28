**THESE SPECS ARE THE ONLY VERSION - IMMUTABLE AND SHOULD NOT BE CHANGED UNDER ANY CIRCUMSTANCES**

# Scrypto Authentication Pattern - WORKING IMPLEMENTATION (2025)

## Overview  
This document defines the PROVEN authentication pattern for Scrypto using middleware route protection. This pattern was perfected through hours of development work and verified against official Supabase 2025 documentation.

## Core Requirements

### Required Packages
```bash
npm install @supabase/ssr @supabase/supabase-js
```

### Deprecated - DO NOT USE
- `@supabase/auth-helpers-nextjs` (deprecated)
- localStorage-based authentication
- `onAuthStateChange` for SSR apps
- Individual cookie methods (get/set/remove) - use getAll/setAll instead

## Three Client Architecture

You MUST create three separate Supabase clients:

### 1. Browser Client (`/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. Server Client (`/lib/supabase/server.ts`)
```typescript
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
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
              cookieStore.set(name, value, options)  // NO OBJECT SPREAD
            )
          } catch {
            // Ignored - Server Components can't write cookies
          }
        },
      },
    }
  )
}

// Helper functions
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
```

### 3. Middleware Client (`/lib/supabase/middleware.ts`)
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Refresh expired auth tokens
  await supabase.auth.getUser()

  return supabaseResponse
}
```

## Root Middleware (`/middleware.ts`)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Skip static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Cookie Methods Explained

### getAll() Method
- Retrieves ALL cookies from the request
- Returns array of `{ name: string; value: string }`
- Used by Supabase to read auth tokens

### setAll() Method
- Sets multiple cookies in the response
- Accepts array of `{ name: string; value: string; options?: CookieOptions }`
- Updates auth tokens after refresh
- Ensures server-client synchronization

### Why getAll/setAll?
1. **Atomic Operations**: Updates all auth cookies together
2. **Token Refresh**: Middleware can refresh expired tokens
3. **SSR Compatibility**: Server can read auth state from cookies
4. **Security**: HTTP-only cookies prevent XSS attacks

## Authentication Flow

### 1. Login (Server Action or API Route)
```typescript
import { createClient } from '@/lib/supabase/server'

export async function login(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  redirect('/dashboard')
}
```

### 2. Protected Page (Server Component)
```typescript
import { requireUser } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const user = await requireUser()
  
  return <div>Welcome {user.email}</div>
}
```

### 3. Sign Out
```typescript
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

## Project Structure
```
/lib/
  /supabase/
    client.ts       # Browser client
    server.ts       # Server client with helpers
    middleware.ts   # Middleware client
/app/
  /api/
    /auth/
      /login/       # Optional API routes
  /(auth)/
    /login/         # Auth pages
    /signup/
  /(protected)/
    /dashboard/     # Protected pages
/middleware.ts      # Root middleware (REQUIRED)
```

## Environment Variables
```env
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (never expose)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Critical Rules

### ✅ DO
- Use `getAll()`/`setAll()` for cookie operations
- Create three separate client types
- Add middleware.ts for token refresh
- Use `await cookies()` in Next.js 15
- Check auth server-side with `getUser()`
- Use NO object spread in server `setAll()`

### ❌ DON'T
- Use deprecated auth-helpers package
- Use `onAuthStateChange` for SSR
- Skip middleware.ts file
- Use individual cookie methods (get/set/remove)
- Trust client-side auth state
- Use object spread in server cookie operations

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Auth not persisting | Missing middleware.ts | Add middleware.ts with updateSession |
| Cookies not setting | Wrong cookie methods | Use getAll/setAll, not get/set/remove |
| Hydration errors | Client/server mismatch | Check auth server-side only |
| Token expired errors | No token refresh | Ensure middleware calls getUser() |
| Object spread errors | Using {...options} | Remove spread, use direct assignment |

## Testing Checklist

- [ ] Middleware.ts exists and calls updateSession
- [ ] Three client files created
- [ ] getAll/setAll implemented correctly
- [ ] NO object spread in server setAll
- [ ] Login sets cookies properly
- [ ] Protected routes redirect when unauthenticated
- [ ] Tokens refresh automatically
- [ ] Sign out clears cookies

## References
- [Official Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15 Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)

---

**This is the ONLY auth spec for Scrypto. All other auth documentation should be deleted.**