import { randomUUID } from 'node:crypto';
import type { TestInfo } from '@playwright/test';
import type { User, UserRole } from '@models/user.model';

/**
 * Test data factory.
 *
 * Uniqueness strategy for parallel/sharded execution:
 *   worker index + shard index + uuid  =>  no collisions across workers or machines.
 *
 * The factory returns intent (what should be created); the caller decides whether
 * to persist it via API/DB. This preserves layer separation.
 */

export interface UserFactoryOverrides {
  readonly role?: UserRole;
  readonly emailDomain?: string;
}

export function buildUser(info: TestInfo, overrides: UserFactoryOverrides = {}): User {
  const worker = info.parallelIndex;
  const shard  = info.config.shard ? `${info.config.shard.current}` : '0';
  const uid    = randomUUID().slice(0, 8);
  const handle = `u-${shard}-${worker}-${uid}`;

  return {
    id: randomUUID(),
    username: handle,
    email: `${handle}@${overrides.emailDomain ?? 'test.local'}`,
    role: overrides.role ?? 'standard',
  };
}
