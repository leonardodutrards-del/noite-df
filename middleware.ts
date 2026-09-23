import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('noite_df_session');

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

  // /admin is intentionally NOT redirected here. Its server layout returns 404
  // unless the authenticated user is the configured Master Admin.
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
};
