/**
 * HTTP Response Helpers
 * 
 * Standardized response helpers for API routes
 * Following Scrypto patterns for consistent API responses
 * 
 * @author Scrypto Development Team
 * @since 2025-08-26
 * @version 1.0.0
 */

import { NextResponse } from 'next/server'

/**
 * Success response helper
 * Returns JSON response with 200 status
 */
export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 })
}

/**
 * Error response helper with error code support
 * Returns JSON error response with specified status
 */
export function bad(
  error: string | Error, 
  code?: string, 
  status: number = 400, 
  additional?: Record<string, any>
) {
  const message = error instanceof Error ? error.message : error
  
  const errorResponse: any = { 
    error: message 
  }
  
  if (code) {
    errorResponse.code = code
  }
  
  if (additional) {
    Object.assign(errorResponse, additional)
  }
  
  return NextResponse.json(errorResponse, { status })
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
 * Validation error helper
 */
export function validationError(errors: string[] | string) {
  const errorList = Array.isArray(errors) ? errors : [errors]
  return NextResponse.json(
    { 
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { errors: errorList }
    },
    { status: 400 }
  )
}

/**
 * Rate limit exceeded helper
 */
export function rateLimitExceeded(message: string = 'Rate limit exceeded') {
  return NextResponse.json(
    { 
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    { status: 429 }
  )
}

/**
 * Service unavailable helper
 */
export function serviceUnavailable(message: string = 'Service temporarily unavailable') {
  return NextResponse.json(
    { 
      error: message,
      code: 'SERVICE_UNAVAILABLE'
    },
    { status: 503 }
  )
}