import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireMasterAdmin(request);
    const establishments = await establishmentService.listAllForAdmin(user);
    return NextResponse.json({ establishments });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao listar estabelecimentos.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
