import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { getTokenFromRequest, SESSION_COOKIE_NAME } from '@/modules/auth/session';

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (token) {
    await authService.logout(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}
