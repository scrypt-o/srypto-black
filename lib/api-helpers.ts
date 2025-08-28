import { NextResponse, NextRequest } from 'next/server'

/**
 * Success response helper
 * Returns JSON response with 200 status
 */
export function ok<T>(data: T) {
  return NextResponse.json(data)
}

/**
 * Error response helper
 * Returns JSON error response with specified status
 */
export function bad(error: string | Error, status: number = 400) {
  const message = error instanceof Error ? error.message : error
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * Not found response helper
 */
export function notFound(message: string = 'Resource not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  )
}

/**
 * Unauthorized response helper
 */
export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Forbidden response helper
 */
export function forbidden(message: string = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

/**
 * Server error response helper
 */
export function serverError(error: string | Error) {
  const message = error instanceof Error ? error.message : error
  console.error('Server Error:', message)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

/**
 * Verify CSRF for non-GET requests using Origin/Referer same-origin policy.
 * Returns NextResponse (403) when invalid; otherwise returns undefined.
 */
export function verifyCsrf(request: NextRequest): NextResponse | undefined {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return undefined

  const origin = request.headers.get('origin') || ''
  const referer = request.headers.get('referer') || ''
  // Prefer configured site URL; fall back to request URL origin
  const expected = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

  const sameOrigin = origin ? origin === expected : referer.startsWith(expected)
  if (!sameOrigin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return undefined
}
