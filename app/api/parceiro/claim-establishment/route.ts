import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { requireAuth } from '@/modules/auth/session';
import type { CreateEstablishmentInput } from '@/modules/establishments/types';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'visitor') {
      return NextResponse.json(
        { error: 'Apenas visitantes podem criar um estabelecimento para se tornarem parceiros.' },
        { status: 403 }
      );
    }

    const body = await request.json() as CreateEstablishmentInput;

    // Validar campos obrigatórios
    if (!body.name || !body.type || !body.region || !body.address) {
      return NextResponse.json(
        { error: 'Nome, tipo, região e endereço são obrigatórios.' },
        { status: 400 }
      );
    }

    // Gerar ID do estabelecimento
    const establishmentId = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // TODO: Em produção, integrar com EstablishmentService e persistir em Supabase
    // Por agora, apenas promover o usuário a partner

    // Converter visitante para partner
    const updatedUser = await authService.convertToPartner(user.id, establishmentId, body.name);

    return NextResponse.json(
      {
        success: true,
        message: 'Parabéns! Você agora é um parceiro Noite DF.',
        user: updatedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar estabelecimento.';

    if (message.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    if (message.includes('apenas')) {
      return NextResponse.json(
        { error: message },
        { status: 403 }
      );
    }

    console.error('Error creating establishment:', error);
    return NextResponse.json(
      { error: 'Erro ao criar estabelecimento. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
