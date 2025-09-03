import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:4560'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 0,
  fullyParallel: true,
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  use: {
    baseURL,
    storageState: 'tests/e2e/storageState.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
