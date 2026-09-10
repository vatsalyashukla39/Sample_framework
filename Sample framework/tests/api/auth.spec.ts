import { test, expect } from '@fixtures/base.fixture';
import { env } from '@config/env';

/**
 * Example API test.
 * Note the layering: test -> AuthApi (domain) -> ApiClient (transport).
 * The test never sees raw HTTP; the transport never sees business meaning.
 */
test.describe('Auth API', () => {
  test('issues a token for valid credentials @smoke', async ({ authApi }) => {
    const { token } = await authApi.login({
      username: env.apiUser.username,
      password: env.apiUser.password,
    });
    expect(token).toBeTruthy();
  });
});
