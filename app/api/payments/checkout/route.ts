import { NextRequest, NextResponse } from 'next/server';
import { getPlan } from '@/lib/plans';
import { getPaymentLink } from '@/lib/payment-links';
import { PAYMENTS_ENABLED, SHOWCASE_MODE } from '@/lib/env';

export async function GET(request: NextRequest) {
  if (SHOWCASE_MODE) {
    return NextResponse.json({ error: 'Pagamentos indisponíveis durante o modo vitrine.' }, { status: 503 });
  }

  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: 'Pagamentos estão desativados.' }, { status: 503 });
  }

  const planId = request.nextUrl.searchParams.get('planId') ?? undefined;
  const plan = getPlan(planId);
  if (!plan || plan.id === 'free') {
    return NextResponse.json({ error: 'Plano inválido para checkout.' }, { status: 400 });
  }

  const paymentLink = getPaymentLink(plan.id);
  if (!paymentLink) {
    return NextResponse.json({ error: 'Link de pagamento não configurado para este plano.' }, { status: 503 });
  }

  return NextResponse.json({ url: paymentLink });
}
