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

  // Build allowlist of acceptable origins
  const envOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.CSRF_ALLOWED_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean)

  // Always allow the current request origin (deployment domain)
  const currentOrigin = request.nextUrl.origin
  const allowed = new Set([currentOrigin, ...envOrigins])

  // Determine the request's declared origin (prefer Origin header; fallback to Referer origin)
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
