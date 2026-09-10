import type { Page, Locator } from '@playwright/test';

/**
 * LoginPage — encapsulates locators and one meaningful behaviour: logging in.
 *
 * Deliberate non-decisions:
 *   - No BasePage. Generic click/fill/wait wrappers add no value over Playwright
 *     and hide the auto-waiting/actionability semantics.
 *   - No inheritance. Pages compose components; they do not extend a framework.
 */
export class LoginPage {
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly submit:   Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit   = page.getByRole('button', { name: /log ?in/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
