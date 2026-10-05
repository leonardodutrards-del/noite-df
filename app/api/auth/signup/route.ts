import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '@/modules/auth/session';
import { sanitizeTextInput } from '@/lib/security';
import { checkAuthRateLimit, requestIp } from '@/lib/security-rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? sanitizeTextInput(body.name) : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }
    if (!password || password.length < 12) {
      return NextResponse.json({ error: 'A senha deve conter pelo menos 12 caracteres.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
    }

    const allowed = await checkAuthRateLimit({
      ip: requestIp(request.headers),
      email,
      limit: 5,
      windowSeconds: 15 * 60,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.' },
        { status: 429 }
      );
    }

    const { user, token, refreshToken, requiresEmailConfirmation } = await authService.signUp({
      email,
      password,
      name,
      role: 'visitor',
    });

    const response = NextResponse.json(
      { user, requiresEmailConfirmation: Boolean(requiresEmailConfirmation) },
      { status: 201 }
    );

    if (token) {
      response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    }
    if (refreshToken) {
      response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar cadastro.';
    if (message === 'AUTH_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Cadastro temporariamente indisponível.' },
        { status: 503 }
      );
    }
    if (message === 'AUTH_EMAIL_RATE_LIMIT') {
      return NextResponse.json(
        { error: 'O serviço de e-mail limitou novas tentativas. Aguarde alguns minutos antes de tentar novamente.' },
        { status: 429 }
      );
    }
    if (/already registered|already exists|já está cadastrado/i.test(message)) {
      return NextResponse.json(
        { error: 'Esta conta já existe. Entre com seu e-mail e senha ou use a recuperação de senha.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
