// Provide TextEncoder/TextDecoder for environments where undici or other
// web APIs expect them during Jest runs.
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  // @ts-ignore
  global.TextDecoder = TextDecoder
}

// Ensure fetch exists for tests that may call it (unit-level only).
if (typeof global.fetch === 'undefined') {
  try {
    // Node 18+ has global fetch; this is a fallback if not present
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
    // If undici is not available, tests that rely on fetch should mock it
  }
}

