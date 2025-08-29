import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Build storageState from cookies.txt (Netscape) so we can reuse auth in E2E
export default async function globalSetup() {
  const storagePath = path.join(process.cwd(), 'tests/e2e/storageState.json')
  const cookiesTxt = path.join(process.cwd(), 'cookies.txt')
  const baseURL = process.env.BASE_URL || 'http://localhost:4569'
  const url = new URL(baseURL)

  if (!fs.existsSync(cookiesTxt)) {
    // Create empty storage state if no cookies
    fs.writeFileSync(storagePath, JSON.stringify({ cookies: [], origins: [] }, null, 2))
    return
  }

  const lines = fs.readFileSync(cookiesTxt, 'utf8').split(/\r?\n/)
  const cookies: any[] = []
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const parts = line.split('\t')
    const name = parts[5]
    const value = parts[6]
    if (name && value) {
      cookies.push({
        name,
        value,
        domain: url.hostname,
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
      })
    }
  }

  fs.writeFileSync(storagePath, JSON.stringify({ cookies, origins: [] }, null, 2))
}
