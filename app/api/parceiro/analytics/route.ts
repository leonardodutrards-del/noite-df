import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { getPartnerAnalytics } from '@/modules/analytics/service';
import {
  adminEntitlements,
  getEstablishmentEntitlements,
  hasCapability,
} from '@/modules/payments/entitlements';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const requestedId = request.nextUrl.searchParams.get('establishmentId');
    const establishmentId =
      (user.role === 'admin' || user.role === 'master_admin') ? requestedId || user.establishmentId : user.establishmentId;

    if (!establishmentId) {
      return NextResponse.json({ error: 'Estabelecimento não associado.' }, { status: 400 });
    }

    const entitlements =
      (user.role === 'admin' || user.role === 'master_admin')
        ? adminEntitlements(establishmentId)
        : await getEstablishmentEntitlements(establishmentId);

    if (!hasCapability(entitlements, 'analytics_basic')) {
      return NextResponse.json(
        {
          error: 'Métricas do parceiro estão disponíveis a partir do plano Pro.',
          code: 'PLAN_UPGRADE_REQUIRED',
          requiredPlan: 'pro',
        },
        { status: 402 }
      );
    }

    const requestedDays = Number(request.nextUrl.searchParams.get('days') || 30);
    const detailed = hasCapability(entitlements, 'analytics_detailed');
    const maxDays = detailed ? 365 : 30;
    const days = Math.min(Math.max(Number.isFinite(requestedDays) ? requestedDays : 30, 1), maxDays);
    const analytics = await getPartnerAnalytics(user, establishmentId, days);

    return NextResponse.json({
      analytics: {
        ...analytics,
        conversionRate: detailed ? analytics.conversionRate : null,
      },
      entitlements,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar métricas.';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível carregar as métricas.' }, { status: 500 });
  }
}
