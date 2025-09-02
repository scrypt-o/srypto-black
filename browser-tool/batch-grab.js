#!/usr/bin/env node
/**
 * Batch screenshot runner over key Patient routes.
 * Usage:
 *   node browser-tool/batch-grab.js http://localhost:3000 [--mobile] [--fullpage]
 *   node browser-tool/batch-grab.js https://qa.scrypto.online --auth-cookies="sb-...=base64-..." --mobile
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function readLocalAuthCookie() {
  // Try to read cookies.txt and extract first cookie name=value
  try {
    const txt = fs.readFileSync(path.join(process.cwd(), 'cookies.txt'), 'utf8')
    const lines = txt.split(/\r?\n/) || []
    const cookieLine = lines.find((l) => l && !l.startsWith('#') && l.split('\t').length >= 7)
    if (!cookieLine) return null
    const parts = cookieLine.split('\t')
    const name = parts[5]
    const value = parts[6]
    if (name && value) return `${name}=${value}`
  } catch {}
  return null
}

function runGrab(baseUrl, route, extraArgs) {
  const url = `${baseUrl}${route}`
  const args = ['browser-tool/screen-grab', url, ...extraArgs].filter(Boolean)
  console.log(`\n>>> ${args.join(' ')}`)
  const res = spawnSync('bash', ['-lc', args.join(' ')], { stdio: 'inherit' })
  return res.status === 0
}

function main() {
  const argv = process.argv.slice(2)
  if (argv.length === 0) {
    console.log('Usage: node browser-tool/batch-grab.js <baseUrl> [--mobile] [--fullpage] [--auth-cookies="name=value"]')
    process.exit(1)
  }
  const baseUrl = argv[0].replace(/\/$/, '')
  const extraArgs = []
  if (argv.includes('--mobile')) extraArgs.push('--mobile')
  if (argv.includes('--fullpage')) extraArgs.push('--fullpage')
  const cookiesArg = argv.find(a => a.startsWith('--auth-cookies='))
  if (cookiesArg) {
    extraArgs.push(cookiesArg)
  } else {
    const c = readLocalAuthCookie()
    if (c && baseUrl.includes('localhost')) extraArgs.push(`--auth-cookies="${c}"`)
  }

  // Patient key routes (non-dynamic)
  const routes = [
    '/patient',
    '/patient/comm', '/patient/comm/inbox', '/patient/comm/alerts', '/patient/comm/notifications', '/patient/comm/history', '/patient/comm/compose',
    '/patient/persinfo', '/patient/persinfo/profile', '/patient/persinfo/medical-aid', '/patient/persinfo/addresses',
    '/patient/persinfo/addresses/home', '/patient/persinfo/addresses/postal', '/patient/persinfo/addresses/delivery',
    '/patient/persinfo/documents', '/patient/persinfo/emergency-contacts', '/patient/persinfo/dependents',
    '/patient/medhist', '/patient/medhist/allergies', '/patient/medhist/conditions', '/patient/medhist/immunizations', '/patient/medhist/surgeries', '/patient/medhist/family-history',
    '/patient/medhist/allergies/new', '/patient/medhist/conditions/new', '/patient/medhist/immunizations/new', '/patient/medhist/surgeries/new',
    '/patient/medications', '/patient/medications/active', '/patient/medications/history', '/patient/medications/adherence',
    '/patient/vitality', '/patient/vitality/vital-signs',
    '/patient/location/nearest-services',
    '/patient/presc', '/patient/presc/scan', '/patient/presc/active',
    '/patient/labresults', '/patient/deals', '/patient/appointments', '/patient/chat'
  ]

  let ok = true
  for (const r of routes) {
    ok = runGrab(baseUrl, r, extraArgs) && ok
  }
  process.exit(ok ? 0 : 1)
}

if (require.main === module) main()

