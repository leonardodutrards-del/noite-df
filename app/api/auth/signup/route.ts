import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/modules/auth/session';
import { sanitizeTextInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? sanitizeTextInput(body.name) : '';
    const establishmentName = typeof body.establishmentName === 'string' ? sanitizeTextInput(body.establishmentName) : undefined;
    const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId.trim() : undefined;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }
    if (!password || password.length < 12) {
      return NextResponse.json({ error: 'A senha deve conter pelo menos 12 caracteres.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
    }

    const { user, token } = await authService.signUp({
      email,
      password,
      name,
      establishmentName,
      establishmentId,
      role: 'partner',
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar cadastro.';
    if (message === 'AUTH_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Cadastro temporariamente indisponível.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
