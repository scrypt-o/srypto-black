import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'

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

  // Minimal, safe security headers (keep conservative to avoid breakage)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('X-Frame-Options', 'DENY')
  // Very simple CSP for an SSR-first app; adjust if needed when adding external assets
  const csp = [
    "default-src 'self'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join('; ')
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  // Apply broadly to app and API; exclude Next static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
