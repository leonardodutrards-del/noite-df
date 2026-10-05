import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { calculateEstablishmentCompleteness } from '@/modules/operations/completeness';
import {
  listPipeline,
  updatePipeline,
  type PipelineStage,
  type VisitStatus,
} from '@/modules/operations/pipeline';

const allowedStages = new Set<PipelineStage>([
  'uncontacted','contacted','replied','trial','partner','paused','lost',
]);

const allowedVisitStatuses = new Set<VisitStatus>([
  'not_visited','visited','owner_contacted','interested','follow_up','trial','signed','lost',
]);

const stageForVisitStatus: Record<VisitStatus, PipelineStage> = {
  not_visited: 'uncontacted',
  visited: 'contacted',
  owner_contacted: 'replied',
  interested: 'replied',
  follow_up: 'replied',
  trial: 'trial',
  signed: 'partner',
  lost: 'lost',
};

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
    const visitStatus =
      typeof body.visitStatus === 'string' && allowedVisitStatuses.has(body.visitStatus as VisitStatus)
        ? (body.visitStatus as VisitStatus)
        : undefined;
    const requestedStage =
      typeof body.stage === 'string' && allowedStages.has(body.stage as PipelineStage)
        ? (body.stage as PipelineStage)
        : undefined;
    const stage = requestedStage ?? (visitStatus ? stageForVisitStatus[visitStatus] : undefined);

    if (!establishmentId || !stage) {
      return NextResponse.json({ error: 'Estabelecimento ou etapa inválida.' }, { status: 400 });
    }

    const pipeline = await updatePipeline({
      establishmentId,
      stage,
      contactChannel:
        typeof body.contactChannel === 'string'
          ? body.contactChannel
          : visitStatus && visitStatus !== 'not_visited'
            ? 'presencial'
            : undefined,
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 2000) : undefined,
      visitStatus,
      visitNotes: typeof body.visitNotes === 'string' ? body.visitNotes.slice(0, 2000) : undefined,
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
