#!/usr/bin/env node
// Puppeteer login + screenshot helper
// Usage: node browser-tool/login-grab.js <baseUrl> <email> <password> <pathToCapture>

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function loginAndGrab(baseUrl, email, password, capturePath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
  })
  const page = await browser.newPage()
  try {
    const loginUrl = baseUrl.replace(/\/$/, '') + '/login'
    console.log('🔐 Navigating to', loginUrl)
    await page.goto(loginUrl, { waitUntil: 'networkidle0', timeout: 20000 })

    // Try common selectors
    const emailSel = 'input[type="email"], input[name="email"], #email'
    const passSel = 'input[type="password"], input[name="password"], #password'
    const submitSel = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In"), button:has-text("Login")'

    const emailEl = await page.$(emailSel)
    const passEl = await page.$(passSel)
    if (!emailEl || !passEl) throw new Error('Login form not found')
    await emailEl.click({ clickCount: 3 })
    await emailEl.type(email, { delay: 10 })
    await passEl.click({ clickCount: 3 })
    await passEl.type(password, { delay: 10 })

    const submitEl = await page.$(submitSel) || await page.$('button')
    if (!submitEl) throw new Error('Submit button not found')
    await Promise.all([
      submitEl.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {})
    ])

    // After login, navigate to capturePath
    const targetUrl = baseUrl.replace(/\/$/, '') + capturePath
    console.log('📄 Navigating to', targetUrl)
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 20000 })
    await page.waitForSelector('body', { timeout: 10000 })

    const outDir = path.join(process.cwd(), 'docs/testing/screen-grabs')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    const ts = new Date().toISOString().replace(/[-:T]/g,'').slice(0,15)
    const fname = `${ts}-${capturePath.replace(/\//g,'-').replace(/^-/, '') || 'homepage'}-desktop.png`
    const outPath = path.join(outDir, fname)
    await page.setViewport({ width: 1280, height: 900 })
    await page.screenshot({ path: outPath, fullPage: false })
    console.log('✅ Screenshot saved:', outPath)

    // dump auth cookie to cookies.txt (optional for later runs)
    const cookies = await page.cookies()
    const supa = cookies.find(c => c.name.includes('auth-token'))
    if (supa) {
      const cookieLine = [
        new URL(baseUrl).hostname,
        'FALSE','/', 'FALSE',
        (Math.floor(Date.now()/1000)+3600).toString(),
        supa.name,
        supa.value
      ].join('\t')
      try {
        fs.appendFileSync('cookies.txt', `\n${cookieLine}\n`)
        console.log('🔑 Auth cookie appended to cookies.txt')
      } catch {}
    }

  } catch (e) {
    console.error('❌ Login/capture error:', e.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

if (require.main === module) {
  const [baseUrl, email, password, capturePath='/patient/persinfo/profile'] = process.argv.slice(2)
  if (!baseUrl || !email || !password) {
    console.log('Usage: node browser-tool/login-grab.js <baseUrl> <email> <password> [capturePath]')
    process.exit(1)
  }
  loginAndGrab(baseUrl, email, password, capturePath)
}

module.exports = { loginAndGrab }

