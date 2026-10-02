import { NextRequest, NextResponse } from 'next/server';
import { PAYMENTS_ENABLED, SHOWCASE_MODE } from '@/lib/env';
import { getPlan, isPaidPlan } from '@/lib/plans';
import { syncSubscriptionResource } from '@/lib/mercado-pago';
import { requireAuth } from '@/modules/auth/session';
import { getEstablishmentEntitlements } from '@/modules/payments/entitlements';
import { insertRow } from '@/lib/supabase-rest';

export async function POST(request: NextRequest) {
  if (SHOWCASE_MODE || !PAYMENTS_ENABLED) {
    return NextResponse.json({ error: 'Pagamentos indisponíveis neste ambiente.' }, { status: 503 });
  }

  try {
    const user = await requireAuth(request);
    if (user.role !== 'partner' && user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Conclua o vínculo do estabelecimento antes de assinar.', code: 'PARTNER_REQUIRED' },
        { status: 403 }
      );
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Mercado Pago ainda não configurado.' }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const planId = typeof body.planId === 'string' ? body.planId : undefined;
    const plan = getPlan(planId);
    const requestedEstablishmentId =
      typeof body.establishmentId === 'string' ? body.establishmentId : undefined;
    const establishmentId =
      (user.role === 'admin' || user.role === 'master_admin') ? requestedEstablishmentId || user.establishmentId : user.establishmentId;

    if (!plan || !isPaidPlan(plan.id) || !establishmentId) {
      return NextResponse.json({ error: 'Plano ou estabelecimento inválido.' }, { status: 400 });
    }

    const current = await getEstablishmentEntitlements(establishmentId);
    if (current.source === 'subscription') {
      return NextResponse.json(
        {
          error: 'Já existe uma assinatura com acesso vigente. Para evitar cobrança dupla, a troca de plano deve ser tratada antes de criar uma nova assinatura.',
          code: 'SUBSCRIPTION_ALREADY_ACTIVE',
          currentPlan: current.planCode,
        },
        { status: 409 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const externalReference = `noite-df:${establishmentId}:${plan.id}:${Date.now()}`;
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: `Noite DF ${plan.name}`,
        external_reference: externalReference,
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.priceCents / 100,
          currency_id: 'BRL',
        },
        back_url: `${baseUrl}/pagamento/retorno`,
        notification_url: `${baseUrl}/api/payments/webhook`,
        status: 'pending',
      }),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok || typeof data.id !== 'string') {
      console.error('mercado-pago-create-subscription', data);
      return NextResponse.json(
        { error: 'Mercado Pago recusou a criação da assinatura.' },
        { status: 502 }
      );
    }

    await syncSubscriptionResource({
      id: data.id,
      status: typeof data.status === 'string' ? data.status : undefined,
      external_reference:
        typeof data.external_reference === 'string' ? data.external_reference : externalReference,
      payer_email: typeof data.payer_email === 'string' ? data.payer_email : user.email,
      next_payment_date:
        typeof data.next_payment_date === 'string' ? data.next_payment_date : undefined,
      auto_recurring:
        data.auto_recurring && typeof data.auto_recurring === 'object'
          ? (data.auto_recurring as { transaction_amount?: number })
          : { transaction_amount: plan.priceCents / 100 },
    });

    if (typeof data.init_point !== 'string' || !data.init_point) {
      return NextResponse.json({ error: 'Mercado Pago não retornou o endereço de pagamento.' }, { status: 502 });
    }

    await insertRow('interactions', {
      user_id: user.id,
      establishment_id: establishmentId,
      action: 'subscription_checkout',
      metadata: {
        planId: plan.id,
        provider: 'mercado_pago',
        providerSubscriptionId: data.id,
        source: 'partner_checkout',
      },
    }).catch((error) => console.error('checkout-analytics', error));

    return NextResponse.json({
      id: data.id,
      initPoint: data.init_point,
      planId: plan.id,
      establishmentId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao iniciar assinatura.';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    console.error('create-subscription', error);
    return NextResponse.json({ error: 'Erro inesperado ao iniciar assinatura.' }, { status: 500 });
  }
}
