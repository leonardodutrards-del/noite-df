import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/modules/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const { user, token } = await authService.login({ email, password });

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Credenciais inválidas.';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
