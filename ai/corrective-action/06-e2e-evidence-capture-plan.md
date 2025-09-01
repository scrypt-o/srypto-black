# 06 — E2E Evidence Capture (Playwright MCP)

## Goal
Capture end-to-end screenshots and basic flow checks for shipped streams to provide proof of correctness.

## Scope
- Streams: Allergies, Immunizations, Dependents, Emergency Contacts, Family History, Prescriptions (list).
- Save screenshots under `ai/testing/` with YYYYMMDD naming.

## Success Criteria (Measurable)
- [ ] At least one list view screenshot per stream.
- [ ] One create or detail view screenshot per stream where applicable.
- [ ] Basic navigations exercised against https://qa.scrypto.online using provided creds.

## Tasks
1) MCP readiness
- If browser installation fails: HALT, request session restart (per init.md).

2) Run scenarios
- Login → navigate to each stream → take screenshot(s).
- Name and move files as per `ai/init.md` Testing Screenshots.

3) Store evidence
- Place images under `ai/testing/` (not `.playwright-mcp/`).

## Example Snippet (Playwright)
```ts
test('Allergies list loads', async ({ page }) => {
  await page.goto('https://qa.scrypto.online/login')
  await page.getByRole('textbox', { name: /email/i }).fill('t@t.com')
  await page.getByRole('textbox', { name: /password/i }).fill('t12345')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.goto('https://qa.scrypto.online/patient/medhist/allergies')
  await page.screenshot({ path: 'ai/testing/20250901-allergies-list.png', fullPage: true })
})
```

## Timebox & Ownership
- Est. effort: 0.5 day (assuming MCP available).
- Owner: QA/FE engineer.

