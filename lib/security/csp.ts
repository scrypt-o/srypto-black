export function buildCsp({ env, nonce }: { env: 'development' | 'production'; nonce?: string }) {
  if (env === 'development') {
    return [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ')
  }
  const parts: string[] = []
  parts.push("default-src 'self'")
  parts.push("img-src 'self' data:")
  // Allow inline styles/scripts that carry the per-request nonce (when provided)
  if (nonce && nonce.trim().length > 0) {
    parts.push(`style-src 'self' 'nonce-${nonce}'`)
    parts.push(`script-src 'self' 'nonce-${nonce}'`)
  } else {
    // When nonce is absent, do not emit an empty nonce token; rely on external scripts only
    parts.push("style-src 'self'")
    parts.push("script-src 'self'")
  }
  parts.push("connect-src 'self' https:")
  parts.push("frame-ancestors 'none'")
  parts.push("base-uri 'self'")
  parts.push("form-action 'self'")
  return parts.join('; ')
}
