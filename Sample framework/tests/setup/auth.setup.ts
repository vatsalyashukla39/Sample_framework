import { test as setup, expect } from '@playwright/test';
import { env } from '@config/env';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';

/**
 * Authentication setup project.
 *
 * Why this exists:
 *   Logging in through the UI in every test is slow, brittle, and couples every
 *   test to the login flow. Instead we authenticate ONCE per run and reuse the
 *   resulting storageState across all UI projects via `dependencies: ['setup']`.
 *
 * Why it delegates to LoginPage / DashboardPage:
 *   Duplicating login locators here would create two sources of truth for the
 *   same UI. When the login form changes, ONE file changes.
 *
 * Trade-off accepted:
 *   Tests share an authenticated identity. Tests that MUST NOT share a session
 *   (e.g. login-flow tests themselves, permission escalation) should override
 *   `storageState: { cookies: [], origins: [] }` in test.use().
 */
const AUTH_FILE = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.loginAs(env.user.username, env.user.password);

  await expect(dashboardPage.welcome).toBeVisible();
  await page.context().storageState({ path: AUTH_FILE });
});
