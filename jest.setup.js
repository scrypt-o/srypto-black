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
