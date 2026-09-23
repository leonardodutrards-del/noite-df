import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { PAYMENTS_ENABLED, SHOWCASE_MODE } from '@/lib/env';
import { syncSubscriptionResource } from '@/lib/mercado-pago';

const PLANS = {
  pro: { reason: 'Noite DF Pro', amount: 99.9 },
  premium: { reason: 'Noite DF Premium', amount: 249.9 },
  enterprise: { reason: 'Noite DF Enterprise', amount: 1500 },
} as const;

export async function POST(request: NextRequest) {
  if (SHOWCASE_MODE || !PAYMENTS_ENABLED) {
    return NextResponse.json({ error: 'Pagamentos indisponíveis neste ambiente.' }, { status: 503 });
  }

  try {
    const user = await requireAuth(request);
    if (user.role !== 'partner' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas parceiros podem contratar planos.' }, { status: 403 });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Mercado Pago ainda não configurado.' }, { status: 503 });
    }

    const { planId, email, establishmentId: requestedEstablishmentId } = await request.json();
    const plan = PLANS[planId as keyof typeof PLANS];
    const establishmentId =
      user.role === 'admin' ? requestedEstablishmentId || user.establishmentId : user.establishmentId;

    if (
      !plan ||
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof establishmentId !== 'string' ||
      !establishmentId
    ) {
      return NextResponse.json({ error: 'Plano, e-mail ou estabelecimento inválido.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const externalReference = `noite-df:${establishmentId}:${planId}:${Date.now()}`;
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: plan.reason,
        external_reference: externalReference,
        payer_email: email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.amount,
          currency_id: 'BRL',
        },
        back_url: `${baseUrl}/pagamento/retorno`,
        status: 'pending',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Mercado Pago recusou a criação da assinatura.' },
        { status: 502 }
      );
    }

    await syncSubscriptionResource({
      id: data.id,
      status: data.status,
      external_reference: data.external_reference ?? externalReference,
      payer_email: data.payer_email ?? email,
      next_payment_date: data.next_payment_date,
      auto_recurring: data.auto_recurring,
    });

    return NextResponse.json({ id: data.id, initPoint: data.init_point });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao iniciar assinatura.';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    console.error('create-subscription', error);
    return NextResponse.json({ error: 'Erro inesperado ao iniciar assinatura.' }, { status: 500 });
  }
}
