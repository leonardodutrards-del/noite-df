import { NextRequest, NextResponse } from 'next/server';
import { supabaseSendPasswordReset } from '@/lib/supabase-auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await supabaseSendPasswordReset(email, `${appUrl}/redefinir-senha`);
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
  } catch (error) {
    console.error('password-reset-request', error);
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
  }
}
