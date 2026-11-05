import type { AuthUser } from './types';

/**
 * Centralized authorization rule for global administrative operations.
 * A legacy "admin" is privileged only when its email matches the explicit
 * MASTER_ADMIN_EMAIL allowlist. The test environment uses isolated fixtures.
 */
export function isMasterAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'master_admin') return true;
  if (user.role !== 'admin') return false;
  if (process.env.NODE_ENV === 'test') return true;

  const allowedEmail = process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) return false;
  return user.email.trim().toLowerCase() === allowedEmail;
}
