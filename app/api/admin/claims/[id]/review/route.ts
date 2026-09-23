import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { partnershipService } from '@/modules/partnerships/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireMasterAdmin(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const decision = body.decision === 'approved' ? 'approved' : body.decision === 'rejected' ? 'rejected' : null;
    if (!decision) {
      return NextResponse.json({ error: 'Decisão deve ser approved ou rejected.' }, { status: 400 });
    }
    const claim = await partnershipService.reviewClaim(
      id,
      decision,
      admin,
      typeof body.reason === 'string' ? body.reason.trim() : undefined
    );
    return NextResponse.json({ claim });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao revisar solicitação.';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    if (message === 'CLAIM_NOT_FOUND') return NextResponse.json({ error: 'Solicitação não encontrada.' }, { status: 404 });
    if (message === 'CLAIM_ALREADY_REVIEWED') return NextResponse.json({ error: 'Solicitação já revisada.' }, { status: 409 });
    console.error('review-claim', error);
    return NextResponse.json({ error: 'Não foi possível revisar a solicitação.' }, { status: 500 });
  }
}
