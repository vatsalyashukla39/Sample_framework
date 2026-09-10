import type { ApiClient } from '@api/api.client';
import type { Credentials } from '@models/user.model';

/**
 * Domain-facing authentication service.
 * Tests depend on this, not on raw HTTP.
 *
 * Boundary translation lives here:
 *   The domain speaks `{ token }` (implementation-agnostic). The upstream API
 *   (dummyjson) returns `{ accessToken, refreshToken, ... }`. Mapping the
 *   external shape → domain shape here means tests never see vendor-specific
 *   field names, and swapping the upstream provider is a single-file change.
 */
interface DummyJsonAuthResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  async login(creds: Credentials): Promise<{ token: string }> {
    const res = await this.client.post<DummyJsonAuthResponse>('/auth/login', creds);
    return { token: res.accessToken };
  }
}
