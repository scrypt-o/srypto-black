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
  return [
    "default-src 'self'",
    "img-src 'self' data:",
    // Allow inline styles that carry the per-request nonce (e.g., next/font)
    `style-src 'self' 'nonce-${nonce ?? ''}'`,
    // Allow inline scripts that carry the per-request nonce
    `script-src 'self' 'nonce-${nonce ?? ''}'`,
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}
