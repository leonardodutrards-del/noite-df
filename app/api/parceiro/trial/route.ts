import { NextRequest, NextResponse } from 'next/server';
import { PAYMENTS_ENABLED, SHOWCASE_MODE } from '@/lib/env';
import { requireAuth } from '@/modules/auth/session';
import { authService } from '@/modules/auth/service';
import { createEnterprisePromotionCheckout } from '@/lib/enterprise-promotion';

export async function POST(request: NextRequest) {
  if (!PAYMENTS_ENABLED || SHOWCASE_MODE || !process.env.MERCADO_PAGO_ACCESS_TOKEN) return NextResponse.json({ error: 'Pagamentos indisponíveis.' }, { status: 503 });
  try {
    const user = await requireAuth(request);
    if (!['partner','admin','master_admin'].includes(user.role)) return NextResponse.json({ error: 'Vincule seu estabelecimento antes de ativar a promoção.' }, { status: 403 });
    const body = await request.json().catch(() => ({}));
    if (body.planId !== 'enterprise' || body.acceptRecurringTerms !== true) return NextResponse.json({ error: 'Confirme o aceite: um mês grátis, depois R$ 150/mês, com cancelamento a qualquer momento.' }, { status: 400 });
    const establishmentId = ['admin','master_admin'].includes(user.role) ? body.establishmentId || user.establishmentId : user.establishmentId;
    if (typeof establishmentId !== 'string' || !establishmentId) return NextResponse.json({ error: 'Estabelecimento não associado.' }, { status: 400 });
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const initPoint = await createEnterprisePromotionCheckout(establishmentId, origin);
    await authService.logAudit({ actorId: user.id, actorEmail: user.email, actorRole: user.role, action: 'enterprise_promotion_checkout_started', entityType: 'establishment', entityId: establishmentId, details: { months: 1, priceAfterTrialCents: 15000, acceptedRecurringTerms: true } });
    // Opening checkout never grants access; the signed provider confirmation does.
    return NextResponse.json({ initPoint, paymentMethodRequired: true, promotionMonths: 1 });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'UNAUTHORIZED') return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    if (code === 'PROMOTION_NOT_ELIGIBLE') return NextResponse.json({ error: 'Promoção disponível para locais cadastrados até 13/10/2026 e com cadastro habilitado.', code }, { status: 403 });
    if (code === 'TRIAL_ALREADY_USED' || code === 'SUBSCRIPTION_ALREADY_ACTIVE') return NextResponse.json({ error: code === 'TRIAL_ALREADY_USED' ? 'Este local já utilizou a promoção.' : 'O local já tem uma assinatura vigente. Entre em contato para ajustar o benefício sem cobrança dupla.', code }, { status: 409 });
    console.error('enterprise-promotion-checkout', code);
    return NextResponse.json({ error: 'Não foi possível validar as condições da promoção no Mercado Pago. Nenhum acesso foi liberado.' }, { status: 502 });
  }
}
