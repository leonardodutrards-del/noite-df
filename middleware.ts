import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('noite_df_session');

  // Protect /parceiro routes (except /parceiro/login and /parceiro/cadastro if any)
  if (path === '/parceiro' || path.startsWith('/parceiro/')) {
    if (path === '/parceiro/login') {
      return NextResponse.redirect(new URL('/login?redirect=/parceiro', request.url));
    }
    if (path === '/parceiro/cadastro') {
      return NextResponse.redirect(new URL('/cadastro', request.url));
    }
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin routes
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/parceiro/:path*', '/parceiro', '/admin/:path*', '/admin'],
};
