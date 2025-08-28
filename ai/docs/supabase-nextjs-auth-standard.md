# Supabase + Next.js Authentication Standard (2025)

## Overview
This document outlines the current best practices for implementing authentication with Supabase and Next.js 14/15 using the App Router and Server-Side Rendering (SSR).

## Core Package Requirements

### Required Packages
```bash
npm install @supabase/ssr @supabase/supabase-js
```

### ⚠️ Important: Deprecated Packages
- **DO NOT USE**: `@supabase/auth-helpers-nextjs` (deprecated)
- **DO NOT USE**: localStorage-based authentication
- **DO NOT USE**: `onAuthStateChange` for SSR apps

## Architecture: Three Client Types

You must create three separate Supabase clients for different contexts:

### 1. Browser Client (`/utils/supabase/client.ts`)
- Used in Client Components
- Runs in the browser
- Handles client-side authentication

### 2. Server Client (`/utils/supabase/server.ts`)
- Used in Server Components
- Used in Server Actions
- Used in Route Handlers
- Runs only on the server

### 3. Middleware Client (`/utils/supabase/middleware.ts`)
- Used in Next.js middleware
- Handles token refresh
- Manages cookie operations

## Cookie Management: getAll and setAll

### What are getAll and setAll?

These are cookie management methods required by Supabase SSR to properly handle authentication cookies across server and client boundaries.

### getAll Method
```typescript
getAll(): { name: string; value: string }[]
```
- Retrieves all cookies from the request
- Returns an array of cookie objects with name/value pairs
- Used by Supabase to read auth tokens from cookies
- Essential for server-side authentication checks

### setAll Method
```typescript
setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]): void
```
- Sets multiple cookies in the response
- Used to update auth tokens after refresh
- Ensures cookies are properly synchronized between server and client
- Critical for maintaining authentication state

### Implementation Example

#### Server Client Cookie Handler
```typescript
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function createClient() {
  const cookieStore = cookies()

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
            // The `setAll` method is called from Server Components.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

#### Middleware Cookie Handler
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // IMPORTANT: Refresh session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}
```

#### Browser Client Cookie Handler
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  // Browser client handles cookies automatically via document.cookie
}
```

## Why getAll and setAll are Critical

### 1. **Token Refresh Flow**
- Server Components cannot write cookies directly
- Middleware uses `setAll` to refresh expired tokens
- Updated tokens are passed to both server and browser

### 2. **SSR Compatibility**
- `getAll` ensures server can read auth state from cookies
- Enables proper server-side rendering with authentication
- Prevents hydration mismatches

### 3. **Security**
- Cookies are HTTP-only (when configured)
- Prevents XSS attacks (unlike localStorage)
- Works across all deployment environments (Edge, Node.js)

## Project Structure

```
project-root/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── callback/
│   │   └── (protected)/
│   │       └── dashboard/
│   ├── middleware.ts          # Root-level middleware
│   └── utils/
│       └── supabase/
│           ├── client.ts       # Browser client
│           ├── server.ts       # Server client  
│           └── middleware.ts   # Middleware client
└── .env.local
```

## Environment Variables

```env
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (never expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Authentication Flow

### 1. Sign Up/Sign In
```typescript
// Server Action or Route Handler
const supabase = createClient() // Server client
const { data, error } = await supabase.auth.signUp({
  email,
  password,
})
```

### 2. Middleware Token Refresh
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Creates response with refreshed tokens via setAll
  const supabase = createClient(request)
  await supabase.auth.getUser() // Triggers refresh if needed
  return response
}
```

### 3. Protected Route Check
```typescript
// Server Component
const supabase = createClient() // Uses getAll to read cookies
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}
```

### 4. Sign Out
```typescript
// Server Action
const supabase = createClient()
await supabase.auth.signOut()
redirect('/login')
```

## Key Differences from Old Patterns

| Old Pattern | New Pattern (2025) | Why |
|------------|-------------------|-----|
| `onAuthStateChange` | Server-side checks | Client-side only, doesn't work with SSR |
| localStorage tokens | HTTP-only cookies | XSS vulnerability prevention |
| Single client instance | Three client types | Different cookie handling per context |
| Manual token refresh | Middleware auto-refresh | Automatic via `getAll`/`setAll` |
| auth-helpers package | @supabase/ssr | Deprecated, lacks proper SSR support |

## Security Best Practices

1. **Always use middleware for token refresh**
   - Prevents expired tokens in Server Components
   - Ensures consistent auth state

2. **Never expose service role key**
   - Only use in secure server environments
   - Never include in client bundles

3. **Implement proper CORS/CSP headers**
   - Restrict API access to your domain
   - Use Content Security Policy

4. **Use Row Level Security (RLS)**
   - Enable RLS on all tables
   - Write policies for data access control

## Common Pitfalls to Avoid

### ❌ Don't Do This:
```typescript
// Using onAuthStateChange in SSR app
supabase.auth.onAuthStateChange((event, session) => {
  // This won't work properly with SSR
})
```

### ✅ Do This Instead:
```typescript
// Check auth state server-side
const { data: { user } } = await supabase.auth.getUser()
```

### ❌ Don't Do This:
```typescript
// Single client for everything
const supabase = createClient()
```

### ✅ Do This Instead:
```typescript
// Separate clients for different contexts
const browserClient = createBrowserClient()
const serverClient = createServerClient()
const middlewareClient = createMiddlewareClient()
```

## Testing Authentication

### 1. Test Cookie Setting
```typescript
// Verify cookies are set after login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important!
})
// Check response.headers['set-cookie']
```

### 2. Test Token Refresh
```typescript
// Middleware should refresh tokens automatically
// Check that expired tokens get refreshed without user intervention
```

### 3. Test Protected Routes
```typescript
// Verify redirect to login when unauthenticated
// Verify access when authenticated
```

## References

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Cookies Documentation](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Supabase SSR Package](https://www.npmjs.com/package/@supabase/ssr)

## Migration Checklist

If migrating from old auth-helpers:

- [ ] Install @supabase/ssr
- [ ] Remove @supabase/auth-helpers-nextjs
- [ ] Create three separate client files
- [ ] Implement getAll/setAll in each client
- [ ] Add middleware.ts for token refresh
- [ ] Remove onAuthStateChange listeners
- [ ] Update auth checks to server-side
- [ ] Test cookie persistence
- [ ] Verify token refresh works
- [ ] Check protected routes