// Provide TextEncoder/TextDecoder for environments where undici or other
// web APIs expect them during Jest runs.
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  // @ts-ignore
  global.TextDecoder = TextDecoder
}

// Web Streams polyfills required by undici in some Jest environments
try {
  const { ReadableStream, WritableStream, TransformStream } = require('stream/web')
  if (typeof global.ReadableStream === 'undefined') {
    // @ts-ignore
    global.ReadableStream = ReadableStream
  }
  if (typeof global.WritableStream === 'undefined') {
    // @ts-ignore
    global.WritableStream = WritableStream
  }
  if (typeof global.TransformStream === 'undefined') {
    // @ts-ignore
    global.TransformStream = TransformStream
  }
} catch {}

// MessagePort polyfill for undici compatibility 
global.MessagePort = class MessagePort extends EventTarget {
  postMessage() {}
  start() {}
  close() {}
}

// Ensure fetch exists for tests that may call it (unit-level only).
if (typeof global.fetch === 'undefined') {
  try {
    // Prefer undici if available
    const { fetch, Headers, Request, Response } = require('undici')
    // @ts-ignore
    global.fetch = fetch
    // @ts-ignore
    global.Headers = Headers
    // @ts-ignore
    global.Request = Request
    // @ts-ignore
    global.Response = Response
  } catch (_) {
    try {
      // Fallback to node-fetch
      const nf = require('node-fetch')
      // @ts-ignore
      global.fetch = nf.default || nf
    } catch {
      // If neither is available, tests must provide their own fetch
    }
  }
}

// Supabase mocks for API testing
jest.mock('@/lib/supabase-server', () => ({
  getServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 't@t.com' } },
        error: null
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    }))
  }))
}))

// CSRF verification mock
jest.mock('@/lib/api-helpers', () => ({
  verifyCsrf: jest.fn(() => null)
}))
