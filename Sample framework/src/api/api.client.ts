import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '@config/env';

/**
 * Thin HTTP transport around Playwright's APIRequestContext.
 *
 * Responsibilities:
 *   - Own the APIRequestContext lifecycle.
 *   - Apply default headers/base URL.
 *   - Enforce status expectations at the boundary (fail fast on unexpected 5xx).
 *
 * Non-responsibilities:
 *   - Domain semantics (that lives in service classes such as AuthApi).
 *   - Assertions on business behavior (that lives in tests).
 */
export class ApiClient {
  private constructor(private readonly ctx: APIRequestContext) {}

  static async create(token?: string): Promise<ApiClient> {
    const ctx = await request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return new ApiClient(ctx);
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }

  async get<T>(path: string): Promise<T> {
    return this.parse<T>(await this.ctx.get(path), 'GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.parse<T>(await this.ctx.post(path, { data: body }), 'POST', path);
  }

  private async parse<T>(res: APIResponse, method: string, path: string): Promise<T> {
    if (!res.ok()) {
      const text = await res.text().catch(() => '<unreadable>');
      throw new Error(`${method} ${path} failed: ${res.status()} ${res.statusText()} — ${text}`);
    }
    // Boundary cast. Replace with runtime schema validation (zod/valibot) when
    // untrusted responses become a real risk.
    return (await res.json()) as T;
  }
}
