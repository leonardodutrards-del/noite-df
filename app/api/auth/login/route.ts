import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/modules/auth/session';
import { checkAuthRateLimit, requestIp } from '@/lib/security-rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const allowed = await checkAuthRateLimit({
      ip: requestIp(request.headers),
      email,
      limit: 8,
      windowSeconds: 15 * 60,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const { user, token } = await authService.login({ email, password });

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Credenciais inválidas.';
    if (message === 'AUTH_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Autenticação temporariamente indisponível.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
