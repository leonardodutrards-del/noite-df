import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'noite_df_session';
const REFRESH_COOKIE_NAME = 'noite_df_refresh';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  const scriptSrc =
    process.env.NODE_ENV === 'production'
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      "connect-src 'self' https://*.supabase.co https://api.mercadopago.com",
      "upgrade-insecure-requests",
    ].join('; ')
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  return response;
}

function needsRefresh(accessToken?: string): boolean {
  if (!accessToken) return true;

  const parts = accessToken.split('.');
  if (parts.length !== 3) return false;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 <= Date.now() + 60_000;
  } catch {
    return false;
  }
}

async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse | null> {
  const accessToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken || !needsRefresh(accessToken)) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const refreshResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  });

  if (!refreshResponse.ok) return null;

  const payload = (await refreshResponse.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
  };
  if (!payload.access_token) return null;

  const nextRefreshToken = payload.refresh_token || refreshToken;

  request.cookies.set(SESSION_COOKIE_NAME, payload.access_token);
  request.cookies.set(REFRESH_COOKIE_NAME, nextRefreshToken);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('cookie', request.cookies.toString());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(SESSION_COOKIE_NAME, payload.access_token, SESSION_COOKIE_OPTIONS);
  response.cookies.set(REFRESH_COOKIE_NAME, nextRefreshToken, REFRESH_COOKIE_OPTIONS);

  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const refreshedResponse = await refreshSupabaseSession(request).catch(() => null);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Partner area remains discoverable but requires authentication.
  if (path === '/parceiro' || path.startsWith('/parceiro/')) {
    if (path === '/parceiro/login') {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/login?redirect=/parceiro', request.url))
      );
    }
    if (path === '/parceiro/cadastro') {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/cadastro', request.url))
      );
    }
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // Authorization for /admin still happens server-side in its layout.
  // This middleware only keeps a valid Supabase session available to that check.
  return applySecurityHeaders(refreshedResponse ?? NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
};
