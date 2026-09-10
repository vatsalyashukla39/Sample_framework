import type { Page, Locator } from '@playwright/test';

/**
 * DashboardPage — the post-authentication landing page.
 * Field names describe INTENT ("the marker that proves we authenticated"),
 * not the literal heading text, so the target app can change without the
 * test's intent-level assertions changing.
 */
export class DashboardPage {
  readonly welcome: Locator;

  constructor(private readonly page: Page) {
    this.welcome = page.getByRole('heading', { name: 'Secure Area', exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/secure');
  }
}
