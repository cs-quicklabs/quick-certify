import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

export default defineConfig({
  testDir: path.resolve(__dirname, 'Playwright/tests'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['line'], ['allure-playwright']],
  timeout: 50000,

  // Global setup that logs in and saves auth.json if missing
  globalSetup: './global-setup.ts',

  use: {
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  // Two projects:
  // 1. Authenticated tests (all except Login.spec.ts)
  // 2. Fresh session tests (only Login.spec.ts)
  projects: [
    {
      name: 'chromium-auth',
      testIgnore: /.*Login\.spec\.ts/, // skip Login.spec.ts
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'auth.json'), //  uses saved session
        headless: true,
      },
    },
    {
      name: 'chromium-login',
      testMatch: /.*Login\.spec\.ts/, // only run login tests
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined, // Fresh session
        headless: true,
      },
    },
  ],
});
