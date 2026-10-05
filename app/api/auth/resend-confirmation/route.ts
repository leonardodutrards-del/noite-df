import { NextRequest, NextResponse } from 'next/server';
import { supabaseResendSignupConfirmation } from '@/lib/supabase-auth';
import { checkAuthRateLimit, requestIp } from '@/lib/security-rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }

    const allowed = await checkAuthRateLimit({
      ip: requestIp(request.headers),
      email,
      limit: 3,
      windowSeconds: 15 * 60,
    });

    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns minutos antes de reenviar.' },
        { status: 429 }
      );
    }

    await supabaseResendSignupConfirmation(email);

    return NextResponse.json({
      ok: true,
      message: 'Se a conta estiver aguardando confirmação, um novo e-mail será enviado.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'AUTH_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Confirmação temporariamente indisponível.' },
        { status: 503 }
      );
    }
    if (message === 'AUTH_EMAIL_RATE_LIMIT') {
      return NextResponse.json(
        { error: 'O serviço de e-mail limitou novas tentativas. Aguarde alguns minutos.' },
        { status: 429 }
      );
    }

    console.error('resend-signup-confirmation', error);
    return NextResponse.json(
      { error: 'Não foi possível reenviar a confirmação agora.' },
      { status: 502 }
    );
  }
}
