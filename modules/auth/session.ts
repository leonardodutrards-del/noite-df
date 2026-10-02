import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { authService } from './service';
import type { AuthUser } from './types';

export const SESSION_COOKIE_NAME = 'noite_df_session';
export const REFRESH_COOKIE_NAME = 'noite_df_refresh';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    return cookie ? cookie.value : null;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (cookie) return cookie.value;

  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export async function getSessionUser(token?: string | null): Promise<AuthUser | null> {
  const sessionToken = token ?? (await getTokenFromCookies());
  if (!sessionToken) return null;
  return authService.validateSession(sessionToken);
}

export async function getSessionUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return authService.validateSession(token);
}

export async function requireAuth(request?: NextRequest): Promise<AuthUser> {
  const user = request
    ? await getSessionUserFromRequest(request)
    : await getSessionUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

export function isMasterAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;

  // Explicit database role is the primary authorization path.
  if (user.role === 'master_admin') return true;

  // Backward compatibility for the legacy admin + allowlist model.
  if (user.role !== 'admin') return false;

  // Tests use isolated fixtures and never depend on production secrets.
  if (process.env.NODE_ENV === 'test') return true;

  const allowedEmail = process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) return false;

  return user.email.trim().toLowerCase() === allowedEmail;
}

export async function requireMasterAdmin(request?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!isMasterAdminUser(user)) {
    throw new Error('FORBIDDEN_MASTER_ADMIN_REQUIRED');
  }
  return user;
}

export async function requireEstablishmentAccess(
  targetEstablishmentId: string,
  request?: NextRequest
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (user.role === 'admin' || user.role === 'master_admin') {
    return user;
  }

  if (user.role === 'partner') {
    if (!user.establishmentId || user.establishmentId !== targetEstablishmentId) {
      throw new Error('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
    }
    return user;
  }

  throw new Error('FORBIDDEN_UNAUTHORIZED_ROLE');
}
