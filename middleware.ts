import { NextResponse, type NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  const res = NextResponse.next()

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
