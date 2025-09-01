import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'
import { buildCsp } from '@/lib/security/csp'

export async function middleware(request: NextRequest) {
  // Public routes (do not require auth)
  const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password', '/api/auth']
  const { pathname } = request.nextUrl

  // Refresh session cookies if needed (edge-safe) and collect cookies to set
  const { response: sessionRes, setCookies } = await updateSession(request)

  // Basic route protection for patient app
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isProtectedAppRoute = pathname.startsWith('/patient')

  if (!isPublic && isProtectedAppRoute) {
    // Create a supabase client bound to this request to check auth at the edge
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Mirror any new cookies into the session response (will be copied to final response below)
            cookiesToSet.forEach(({ name, value, options }) => {
              sessionRes.cookies.set(name, value, options)
              setCookies.push({ name, value, options })
            })
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const url = new URL('/login', request.url)
      return NextResponse.redirect(url)
    }
  }

  // Build a single per-request nonce and forward to SSR via request headers
  const nonce = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-csp-nonce', nonce)

  // Create the final response, forwarding headers to SSR and re-emitting any Set-Cookie from session refresh
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  // Copy cookies set during session refresh/auth
  setCookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('X-Frame-Options', 'DENY')

  // Build CSP with the same nonce used for SSR
  const env = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production'
  const csp = buildCsp({ env, nonce })
  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('x-nonce', nonce)
  res.headers.set('x-csp-nonce', nonce)
  return res
}

export const config = {
  // Apply broadly to app and API; exclude Next static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
