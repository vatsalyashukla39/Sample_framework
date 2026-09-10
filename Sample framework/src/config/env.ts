import 'dotenv/config';

/**
 * Typed, validated environment configuration.
 *
 * Precedence:  process.env  >  per-environment defaults  >  fail-fast
 *
 * Why not read `process.env` directly in tests/pages?
 *  - Centralizes validation (fail fast, don't discover bad config mid-run).
 *  - Gives compile-time typing for downstream consumers.
 *  - Encodes precedence and secret handling in one place.
 */

export type EnvName = 'local' | 'dev' | 'qa' | 'staging';

interface Credentials {
  readonly username: string;
  readonly password: string;
}

interface AppEnv {
  readonly name: EnvName;
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly user: Credentials;
  readonly apiUser: Credentials;
  readonly isCI: boolean;
}

const defaults: Record<EnvName, Pick<AppEnv, 'baseUrl' | 'apiBaseUrl'>> = {
  local:   { baseUrl: 'http://localhost:3000',       apiBaseUrl: 'http://localhost:3000/api' },
  dev:     { baseUrl: 'https://dev.example.com',     apiBaseUrl: 'https://dev.example.com/api' },
  qa:      { baseUrl: 'https://qa.example.com',      apiBaseUrl: 'https://qa.example.com/api' },
  staging: { baseUrl: 'https://staging.example.com', apiBaseUrl: 'https://staging.example.com/api' },
};

function required(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function resolveEnvName(raw: string | undefined): EnvName {
  const allowed: readonly EnvName[] = ['local', 'dev', 'qa', 'staging'];
  const value = (raw ?? 'qa') as EnvName;
  if (!allowed.includes(value)) {
    throw new Error(`Invalid TEST_ENV="${raw}". Allowed: ${allowed.join(', ')}`);
  }
  return value;
}

function build(): AppEnv {
  const name = resolveEnvName(process.env.TEST_ENV);
  const d = defaults[name];
  const uiUser: Credentials = Object.freeze({
    username: required('TEST_USER', process.env.TEST_USER),
    password: required('TEST_PASSWORD', process.env.TEST_PASSWORD),
  });
  // API credentials fall back to the UI credentials when the target uses a
  // single identity across surfaces. Kept explicit so multi-identity setups
  // (service accounts, machine-to-machine) can override without code changes.
  const apiUser: Credentials = Object.freeze({
    username: process.env.API_USER ?? uiUser.username,
    password: process.env.API_PASSWORD ?? uiUser.password,
  });
  return Object.freeze({
    name,
    baseUrl:    process.env.BASE_URL     ?? d.baseUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? d.apiBaseUrl,
    user: uiUser,
    apiUser,
    isCI: process.env.CI === 'true' || process.env.CI === '1',
  });
}

export const env: AppEnv = build();
