import { test as base, type APIRequestContext } from '@playwright/test';
import { ApiClient } from '@api/api.client';
import { AuthApi } from '@api/auth.api';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';

/**
 * Custom fixtures = the framework's dependency-injection surface.
 *
 * Scope choices:
 *   - `apiClient` is worker-scoped: one HTTP context per worker → fewer connections,
 *     but still isolated across parallel workers. Safe because it is stateless
 *     transport, not shared mutable domain state.
 *   - Pages are test-scoped: each test gets fresh page objects bound to its Page,
 *     preserving test isolation.
 *
 * Composition, not inheritance:
 *   Tests declare what they need in the destructured argument list.
 *   Nothing is created that a test does not ask for.
 */
type WorkerFixtures = {
  apiClient: ApiClient;
};

type TestFixtures = {
  authApi: AuthApi;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  apiClient: [
    async ({}, use) => {
      const client = await ApiClient.create();
      await use(client);
      await client.dispose();
    },
    { scope: 'worker' },
  ],

  authApi: async ({ apiClient }, use) => {
    await use(new AuthApi(apiClient));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
export type { APIRequestContext };
