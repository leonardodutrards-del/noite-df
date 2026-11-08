import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMasterAdminUser } from '@/modules/auth/authorization';
import type { AuthUser } from '@/modules/auth/types';

const user = (role: AuthUser['role'], email = 'staff@example.com'): AuthUser => ({
  id: 'user-1', email, name: 'Test User', role,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

afterEach(() => vi.unstubAllEnvs());

describe('master admin authorization', () => {
  it('accepts the explicit master_admin database role', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MASTER_ADMIN_EMAIL', '');
    expect(isMasterAdminUser(user('master_admin'))).toBe(true);
  });

  it('accepts a legacy admin only when its email matches the allowlist', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MASTER_ADMIN_EMAIL', 'OWNER@example.com');
    expect(isMasterAdminUser(user('admin', 'owner@example.com'))).toBe(true);
    expect(isMasterAdminUser(user('admin', 'other@example.com'))).toBe(false);
  });

  it('never grants global access to partners or visitors', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MASTER_ADMIN_EMAIL', 'owner@example.com');
    expect(isMasterAdminUser(user('partner', 'owner@example.com'))).toBe(false);
    expect(isMasterAdminUser(user('visitor', 'owner@example.com'))).toBe(false);
    expect(isMasterAdminUser(null)).toBe(false);
  });
});
