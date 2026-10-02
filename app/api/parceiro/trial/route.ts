import { NextRequest, NextResponse } from 'next/server';
import { TRIAL_DAYS, TRIAL_ENABLED } from '@/lib/env';
import { getPlan, isPaidPlan } from '@/lib/plans';
import { requireAuth } from '@/modules/auth/session';
import { authService } from '@/modules/auth/service';
import { startTrialForEstablishment } from '@/modules/payments/entitlements';
import { insertRow } from '@/lib/supabase-rest';

export async function POST(request: NextRequest) {
  if (!TRIAL_ENABLED) {
    return NextResponse.json({ error: 'Teste gratuito ainda não está habilitado.' }, { status: 503 });
  }

  try {
    const user = await requireAuth(request);
    if (user.role !== 'partner' && user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Conclua o vínculo do estabelecimento antes de iniciar o teste.', code: 'PARTNER_REQUIRED' },
        { status: 403 }
      );
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

    const entitlements = await startTrialForEstablishment({
      establishmentId,
      planCode: plan.id,
      days: TRIAL_DAYS,
    });

    await authService.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'partner_trial_started',
      entityType: 'establishment',
      entityId: establishmentId,
      details: { planCode: plan.id, trialDays: TRIAL_DAYS },
    });

    await insertRow('interactions', {
      user_id: user.id,
      establishment_id: establishmentId,
      action: 'trial_start',
      metadata: { planId: plan.id, trialDays: TRIAL_DAYS, source: 'partner_trial' },
    }).catch((error) => console.error('trial-analytics', error));

    return NextResponse.json({ entitlements, trialDays: TRIAL_DAYS }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    if (message === 'TRIAL_ALREADY_USED') {
      return NextResponse.json({ error: 'Este estabelecimento já utilizou o teste gratuito.', code: message }, { status: 409 });
    }
    if (message === 'SUBSCRIPTION_ALREADY_ACTIVE') {
      return NextResponse.json({ error: 'Este estabelecimento já possui assinatura ativa.', code: message }, { status: 409 });
    }
    console.error('start-partner-trial', error);
    return NextResponse.json({ error: 'Não foi possível iniciar o teste gratuito.' }, { status: 500 });
  }
}
