import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /* Run tests sequentially for reliable multi-tab scenarios */
  fullyParallel: false,
  workers: 1,

  /* Fail the build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once on CI */
  retries: process.env.CI ? 1 : 0,

  /* Reporters: console list + HTML + Allure */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  use: {
    baseURL: 'https://arjitnigam.github.io/myDreams/',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    /* Screenshot on every test (pass or fail) */
    screenshot: 'on',

    /* Video & trace only on failure to save space */
    /* NOTE: video requires ffmpeg — run `npx playwright install ffmpeg` first */
    /* Change to 'retain-on-failure' once ffmpeg is installed */
    video: 'off',
    trace: 'on-first-retry',

    /* Use system-installed Chrome to avoid CDN download issues */
    channel: 'chrome',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
