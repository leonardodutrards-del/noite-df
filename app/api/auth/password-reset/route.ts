import { NextRequest, NextResponse } from 'next/server';
import { supabaseSendPasswordReset } from '@/lib/supabase-auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
  }

  try {
    const appUrl = process.env.NODE_ENV === 'production'
      ? 'https://www.noitedf.com.br'
      : request.nextUrl.origin;
    await supabaseSendPasswordReset(email, `${appUrl}/redefinir-senha`);
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
  } catch (error) {
    console.error('password-reset-request', error);
    if (error instanceof Error && error.message === 'AUTH_EMAIL_RATE_LIMIT') {
      return NextResponse.json({ message: 'Muitas solicitações em pouco tempo. Aguarde antes de pedir outro link.' }, { status: 429 });
    }
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
  }
}
