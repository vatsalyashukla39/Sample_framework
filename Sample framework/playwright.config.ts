import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Playwright configuration.
 *
 * Design intent:
 *  - Projects express EXECUTION dimensions (browser/device/api), not business behavior.
 *  - CI toggles behavior via env, never via code branches inside tests.
 *  - Artifacts (trace/screenshot/video) are cheap on failure, expensive on success.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? '50%' : undefined,

  reporter: env.isCI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'reports/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // API project — no browser is launched; APIRequestContext only.
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiBaseUrl },
    },

    // Auth setup — produces storageState consumed by dependent UI projects.
    //
    // Design constraint: storageState can only be shared across projects whose
    // browser identity (User-Agent, Accept-Language, ...) matches what the
    // target server binds to the session. Many stacks (Rack, some IdPs, WAFs)
    // fingerprint sessions this way, so we align setup's device with the
    // primary UI project. If you also run firefox-ui / webkit-ui / mobile-chrome
    // against such a target, give each browser its OWN setup project that
    // writes its OWN storageState file, and depend on the matching one.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'chromium-ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    },
    {
      name: 'firefox-ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/user.json' },
    },
    {
      name: 'webkit-ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/user.json' },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], storageState: 'playwright/.auth/user.json' },
    },
  ],

  outputDir: 'test-results',
});
