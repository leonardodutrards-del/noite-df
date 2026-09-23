import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { calculateEstablishmentCompleteness } from '@/modules/operations/completeness';
import { listPipeline, updatePipeline, type PipelineStage } from '@/modules/operations/pipeline';

const allowedStages = new Set<PipelineStage>([
  'uncontacted','contacted','replied','trial','partner','paused','lost',
]);

export async function GET(request: NextRequest) {
  try {
    const admin = await requireMasterAdmin(request);
    const [establishments, pipeline] = await Promise.all([
      establishmentService.listAllForAdmin(admin),
      listPipeline(),
    ]);
    const pipelineById = new Map(pipeline.map((item) => [item.establishmentId, item]));

    const items = establishments.map((place) => ({
      establishment: place,
      completeness: calculateEstablishmentCompleteness(place),
      pipeline: pipelineById.get(place.id) ?? { establishmentId: place.id, stage: 'uncontacted' as PipelineStage },
    }));
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível carregar a operação.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const body = (await request.json()) as Record<string, unknown>;
    const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId : '';
    const stage = typeof body.stage === 'string' ? (body.stage as PipelineStage) : null;

    if (!establishmentId || !stage || !allowedStages.has(stage)) {
      return NextResponse.json({ error: 'Estabelecimento ou etapa inválida.' }, { status: 400 });
    }

    const pipeline = await updatePipeline({
      establishmentId,
      stage,
      contactChannel: typeof body.contactChannel === 'string' ? body.contactChannel : undefined,
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 2000) : undefined,
      nextFollowUpAt:
        typeof body.nextFollowUpAt === 'string' || body.nextFollowUpAt === null
          ? body.nextFollowUpAt
          : undefined,
      trialPlanCode:
        body.trialPlanCode === 'pro' || body.trialPlanCode === 'premium' || body.trialPlanCode === 'enterprise'
          ? body.trialPlanCode
          : undefined,
      subscriptionConsent: body.subscriptionConsent === true,
    });
    return NextResponse.json({ pipeline });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível atualizar o funil.' }, { status: 500 });
  }
}
