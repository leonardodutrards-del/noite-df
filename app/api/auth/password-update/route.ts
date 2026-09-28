import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.accessToken === 'string' ? body.accessToken : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token || password.length < 12) {
    return NextResponse.json({ error: 'Link inválido ou senha com menos de 12 caracteres.' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Recuperação indisponível.' }, { status: 503 });
  }

  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Link expirado ou inválido. Solicite outro e-mail de recuperação.' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível redefinir a senha.' }, { status: 502 });
  }
}
