import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { getPlan } from '@/lib/plans';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';
import {
  adminEntitlements,
  getEstablishmentEntitlements,
} from '@/modules/payments/entitlements';
import { syncSubscriptionResource } from '@/lib/mercado-pago';

type SubscriptionRow = {
  id: string;
  establishment_id: string | null;
  plan_code: string;
  provider_subscription_id: string | null;
  payer_email: string;
  status: string;
  amount_cents: number;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

async function resolveEstablishment(request: NextRequest) {
  const user = await requireAuth(request);
  if (user.role !== 'partner' && user.role !== 'admin') throw new Error('FORBIDDEN_PARTNER_REQUIRED');
  const requestedId = request.nextUrl.searchParams.get('establishmentId');
  const establishmentId =
    user.role === 'admin' ? requestedId || user.establishmentId : user.establishmentId;
  if (!establishmentId) throw new Error('ESTABLISHMENT_REQUIRED');
  return { user, establishmentId };
}

async function latestSubscription(establishmentId: string) {
  const rows = await supabaseAdminJson<SubscriptionRow[]>(
    `subscription_accounts?establishment_id=eq.${encodeURIComponent(establishmentId)}&select=id,establishment_id,plan_code,provider_subscription_id,payer_email,status,amount_cents,current_period_end,created_at,updated_at&order=updated_at.desc&limit=1`
  );
  return rows[0] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const { user, establishmentId } = await resolveEstablishment(request);
    const [subscription, entitlements] = await Promise.all([
      latestSubscription(establishmentId),
      user.role === 'admin'
        ? Promise.resolve(adminEntitlements(establishmentId))
        : getEstablishmentEntitlements(establishmentId),
    ]);

    return NextResponse.json({
      entitlements,
      billing: subscription
        ? {
            id: subscription.id,
            planCode: subscription.plan_code,
            planName: getPlan(subscription.plan_code)?.name ?? subscription.plan_code,
            status: subscription.status,
            amountCents: subscription.amount_cents,
            currentPeriodEnd: subscription.current_period_end,
            startedAt: subscription.created_at,
            recurring: true,
            provider: 'mercado_pago',
            canCancel:
              Boolean(subscription.provider_subscription_id) &&
              ['active', 'pending'].includes(subscription.status),
          }
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    if (message === 'FORBIDDEN_PARTNER_REQUIRED') return NextResponse.json({ error: 'Acesso exclusivo para parceiros.' }, { status: 403 });
    if (message === 'ESTABLISHMENT_REQUIRED') return NextResponse.json({ error: 'Estabelecimento não associado.' }, { status: 400 });
    return NextResponse.json({ error: 'Não foi possível carregar a cobrança.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { establishmentId } = await resolveEstablishment(request);
    const subscription = await latestSubscription(establishmentId);
    if (!subscription?.provider_subscription_id) {
      return NextResponse.json({ error: 'Nenhuma assinatura cancelável foi encontrada.' }, { status: 404 });
    }
    if (!['active', 'pending'].includes(subscription.status)) {
      return NextResponse.json({ error: 'Esta assinatura já não está ativa para novas cobranças.' }, { status: 409 });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 503 });

    const previousPeriodEnd = subscription.current_period_end;
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${encodeURIComponent(subscription.provider_subscription_id)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'canceled' }),
        cache: 'no-store',
      }
    );

    const resource = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      console.error('mercado-pago-cancel-subscription', resource);
      return NextResponse.json({ error: 'Mercado Pago não confirmou o cancelamento.' }, { status: 502 });
    }

    await syncSubscriptionResource({
      id: typeof resource.id === 'string' ? resource.id : subscription.provider_subscription_id,
      status: typeof resource.status === 'string' ? resource.status : 'canceled',
      external_reference:
        typeof resource.external_reference === 'string' ? resource.external_reference : undefined,
      payer_email:
        typeof resource.payer_email === 'string' ? resource.payer_email : subscription.payer_email,
      next_payment_date:
        typeof resource.next_payment_date === 'string' ? resource.next_payment_date : undefined,
      auto_recurring:
        resource.auto_recurring && typeof resource.auto_recurring === 'object'
          ? (resource.auto_recurring as { transaction_amount?: number })
          : { transaction_amount: subscription.amount_cents / 100 },
    });

    if (previousPeriodEnd && Date.parse(previousPeriodEnd) > Date.now()) {
      await supabaseAdminRequest(
        `subscription_accounts?id=eq.${encodeURIComponent(subscription.id)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            status: 'cancelled',
            current_period_end: previousPeriodEnd,
            updated_at: new Date().toISOString(),
          }),
        }
      );
    }

    return NextResponse.json({
      cancelled: true,
      accessUntil:
        previousPeriodEnd && Date.parse(previousPeriodEnd) > Date.now()
          ? previousPeriodEnd
          : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    if (message === 'FORBIDDEN_PARTNER_REQUIRED') return NextResponse.json({ error: 'Acesso exclusivo para parceiros.' }, { status: 403 });
    if (message === 'ESTABLISHMENT_REQUIRED') return NextResponse.json({ error: 'Estabelecimento não associado.' }, { status: 400 });
    return NextResponse.json({ error: 'Não foi possível cancelar a assinatura.' }, { status: 500 });
  }
}
