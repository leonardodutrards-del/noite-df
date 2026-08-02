import { NextRequest, NextResponse } from 'next/server';

const PLANS = {
  pro: { reason: 'Noite DF Pro', amount: 99.9 },
  premium: { reason: 'Noite DF Premium', amount: 249.9 },
  enterprise: { reason: 'Noite DF Enterprise', amount: 1500 },
} as const;

export async function POST(request: NextRequest) {
  if (process.env.SHOWCASE_MODE !== 'false') {
    return NextResponse.json({ error: 'Pagamentos indisponíveis durante o modo vitrine.' }, { status: 503 });
  }

  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: 'Mercado Pago ainda não configurado.' }, { status: 503 });

    const { planId, email } = await request.json();
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Plano ou e-mail inválido.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: plan.reason,
        external_reference: `noite-df:${planId}:${Date.now()}`,
        payer_email: email,
        auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: plan.amount, currency_id: 'BRL' },
        back_url: `${baseUrl}/pagamento/retorno`,
        status: 'pending',
      }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: 'Mercado Pago recusou a criação da assinatura.' }, { status: 502 });
    return NextResponse.json({ id: data.id, initPoint: data.init_point });
  } catch {
    return NextResponse.json({ error: 'Erro inesperado ao iniciar assinatura.' }, { status: 500 });
  }
}
