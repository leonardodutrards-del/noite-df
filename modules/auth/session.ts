import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { authService } from './service';
import type { AuthUser } from './types';

export const SESSION_COOKIE_NAME = 'noite_df_session';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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

export async function requireMasterAdmin(request?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('FORBIDDEN_ADMIN_REQUIRED');
  }
  return user;
}

export async function requireEstablishmentAccess(
  targetEstablishmentId: string,
  request?: NextRequest
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (user.role === 'admin') {
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
