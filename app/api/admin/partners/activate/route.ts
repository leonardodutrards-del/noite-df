import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { partnershipService } from '@/modules/partnerships/service';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireMasterAdmin(request);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email : '';
    const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId : '';

    const activation = await partnershipService.activatePartnerByEmail(admin, {
      email,
      establishmentId,
    });

    return NextResponse.json({ activation }, { status: activation.alreadyLinked ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    if (message.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    }
    if (message === 'PARTNER_ACTIVATION_INVALID_INPUT') {
      return NextResponse.json({ error: 'Informe um e-mail válido e o estabelecimento.' }, { status: 400 });
    }
    if (message === 'PARTNER_ACTIVATION_PROFILE_NOT_FOUND') {
      return NextResponse.json(
        {
          error: 'Conta não encontrada. Peça ao dono para criar a conta em /cadastro e tente novamente.',
          code: message,
        },
        { status: 404 }
      );
    }
    if (message === 'PARTNER_ACTIVATION_ESTABLISHMENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Estabelecimento não encontrado.' }, { status: 404 });
    }
    if (message === 'PARTNER_ACTIVATION_ALREADY_LINKED') {
      return NextResponse.json(
        { error: 'Essa conta já está vinculada a outro estabelecimento.', code: message },
        { status: 409 }
      );
    }
    if (message === 'PARTNER_ACTIVATION_ROLE_NOT_ALLOWED') {
      return NextResponse.json(
        { error: 'Essa conta possui um papel que não pode ser convertido em parceiro.', code: message },
        { status: 409 }
      );
    }

    console.error('partner-manual-activation', error);
    return NextResponse.json(
      { error: 'Não foi possível ativar o parceiro agora.' },
      { status: 500 }
    );
  }
}
