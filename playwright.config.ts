import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Node's unit suite lives beside the browser tests. Keep it out of the
  // Playwright runner so `npm run test` and `npm run test:e2e` stay separate.
  testMatch: /.*\.(spec|test)\.ts/,
  // Firefox and WebKit can need longer than Chromium to create a fresh
  // browser page and hydrate the production bundle. Keep the suite strict,
  // but do not mistake browser startup time for an application failure.
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // The local Vite server compiles route chunks on demand. Parallel browsers
  // can race the first compilation and turn otherwise-valid navigation checks
  // into load timeouts, so keep this shared-app suite deterministic.
  fullyParallel: false,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  webServer: {
    // Exercise the built application. Besides matching the shipped asset
    // layout, this avoids timing tests against Vite's first-request transform
    // of the whole React graph.
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180000,
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
