export function buildCsp({ env, nonce }: { env: 'development' | 'production'; nonce?: string }) {
  if (env === 'development') {
    return [
      "default-src 'self'",
      "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://maps.google.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.google.com",
      "connect-src 'self' https: https://maps.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-ancestors 'none'",
    ].join('; ')
  }
  const parts: string[] = []
  parts.push("default-src 'self'")
  parts.push("img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://maps.google.com https://maps.googleapis.com")
  // Allow inline styles/scripts that carry the per-request nonce (when provided)
  if (nonce && nonce.trim().length > 0) {
    parts.push(`style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`)
    parts.push(`script-src 'self' 'nonce-${nonce}' https://maps.googleapis.com https://maps.google.com`)
  } else {
    // When nonce is absent, do not emit an empty nonce token; rely on external scripts only
    parts.push("style-src 'self' https://fonts.googleapis.com")
    parts.push("script-src 'self' https://maps.googleapis.com https://maps.google.com")
  }
  parts.push("connect-src 'self' https: https://maps.googleapis.com")
  parts.push("font-src 'self' https://fonts.gstatic.com")
  parts.push("frame-ancestors 'none'")
  parts.push("base-uri 'self'")
  parts.push("form-action 'self'")
  return parts.join('; ')
}
