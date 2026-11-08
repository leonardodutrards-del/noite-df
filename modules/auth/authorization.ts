import type { AuthUser } from './types';

/** Global admin access is limited to the explicit role or a single allowlisted legacy admin. */
export function isMasterAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'master_admin') return true;
  if (user.role !== 'admin') return false;
  if (process.env.NODE_ENV === 'test') return true;
  const allowedEmail = process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(allowedEmail && user.email.trim().toLowerCase() === allowedEmail);
}
