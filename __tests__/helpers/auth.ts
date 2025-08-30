import fs from 'fs'
import path from 'path'

export function getBaseUrl() {
  const base = process.env.BASE_URL || 'http://localhost:3000'
  return base.replace(/\/$/, '')
}

export function getOrigin() {
  return getBaseUrl()
}

export function getCookieHeader(): string | undefined {
  // Highest priority: explicit cookie header from env
  const envCookie = process.env.TEST_COOKIE
  if (envCookie && envCookie.trim()) return envCookie.trim()
  // Reuse Playwright storage state if present
  const storagePath = path.join(process.cwd(), 'tests/e2e/storageState.json')
  if (!fs.existsSync(storagePath)) return undefined
  try {
    const json = JSON.parse(fs.readFileSync(storagePath, 'utf8')) as { cookies?: Array<{ name: string; value: string; domain?: string; path?: string }> }
    const url = new URL(getBaseUrl())
    const cookies = (json.cookies || []).filter((c) => !c.domain || c.domain === url.hostname)
    if (!cookies.length) return undefined
    return cookies.map(c => `${c.name}=${c.value}`).join('; ')
  } catch {
    return undefined
  }
}

export function authHeaders(extra: Record<string, string> = {}) {
  const cookie = getCookieHeader()
  return {
    ...(cookie ? { Cookie: cookie } : {}),
    ...extra,
  }
}
