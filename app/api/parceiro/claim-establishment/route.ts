import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { partnershipService } from '@/modules/partnerships/service';
import type { CreateEstablishmentInput } from '@/modules/establishments/types';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user.role !== 'visitor') {
      return NextResponse.json(
        { error: 'Apenas visitantes podem solicitar a gestão de um estabelecimento.' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateEstablishmentInput;
    if (!body.name || !body.type || !body.region || !body.address) {
      return NextResponse.json(
        { error: 'Nome, tipo, região e endereço são obrigatórios.' },
        { status: 400 }
      );
    }

    const claim = await partnershipService.createClaim(user, body);
    return NextResponse.json(
      {
        success: true,
        message: 'Solicitação enviada para análise. O acesso de parceiro será liberado após aprovação.',
        claim,
      },
      { status: 202 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao enviar solicitação.';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    if (message.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso não permitido.' }, { status: 403 });
    }
    if (message === 'CLAIM_ALREADY_PENDING') {
      return NextResponse.json(
        { error: 'Já existe uma solicitação pendente para este estabelecimento.' },
        { status: 409 }
      );
    }
    console.error('claim-establishment', error);
    return NextResponse.json({ error: 'Não foi possível enviar a solicitação.' }, { status: 500 });
  }
}
