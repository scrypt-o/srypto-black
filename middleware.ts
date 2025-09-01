import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'
import { buildCsp } from '@/lib/security/csp'

export async function middleware(request: NextRequest) {
  // Public routes (do not require auth)
  const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password', '/api/auth']
  const { pathname } = request.nextUrl

  // Always refresh session cookies if needed (edge-safe)
  let res = await updateSession(request)

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
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options)
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

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('X-Frame-Options', 'DENY')

  // Build CSP (dev permissive; prod uses nonce)
  // Use a stable per-request nonce so RSC can attach it to inline scripts
  const nonce = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const env = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production'
  const csp = buildCsp({ env, nonce })
  res.headers.set('Content-Security-Policy', csp)
  // Expose nonce using Next's standard header so internals can pick it up
  res.headers.set('x-nonce', nonce)
  // Back-compat while we migrate any consumers
  res.headers.set('x-csp-nonce', nonce)
  return res
}

export const config = {
  // Apply broadly to app and API; exclude Next static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
