import { test, expect } from '@fixtures/base.fixture';

/**
 * Example UI test — arranged/acted/asserted in business terms.
 * Infrastructure (auth state, page objects) is provided by fixtures.
 */
test.describe('Dashboard', () => {
  test('shows a welcome heading for an authenticated user @smoke', async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.welcome).toBeVisible();
    await expect(page).toHaveURL(/\/secure$/);

  });
  test('another test case', async ({ dashboardPage, page }) => {
    // Add test steps here
  });
});
