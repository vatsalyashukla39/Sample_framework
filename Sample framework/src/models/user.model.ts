/**
 * User domain model.
 * Compile-time contract only — untrusted API responses should be validated
 * at the boundary (see api/api.client.ts) before being cast to these types.
 */
export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
}

export type UserRole = 'admin' | 'standard' | 'readonly';

export interface Credentials {
  readonly username: string;
  readonly password: string;
}
