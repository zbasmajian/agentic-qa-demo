import { defineConfig, devices } from '@playwright/test';
const externalURL = process.env.BASE_URL;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  /* GitHub's Linux runners have 4 CPUs, so run 4 test files at once on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* On CI, stop after 5 failures: that many usually share one cause (e.g. a renamed button), and the healer takes over. */
  maxFailures: process.env.CI ? 5 : 0,
  /* Fail fast: a whole test gets 15 s, a missing element or unmet expect fails after 5 s (defaults are 30 s). */
  timeout: 15_000,
  expect: { timeout: 5_000 },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: externalURL ?? 'http://localhost:3000',
    actionTimeout: 5_000,
    navigationTimeout: 10_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: externalURL ? undefined : {
     command: 'npm run build && npm run start',
     url: 'http://localhost:3000/healthz',
     reuseExistingServer: !process.env.CI,
  }
});
