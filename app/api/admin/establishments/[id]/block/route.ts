import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { sanitizeTextInput } from '@/lib/security';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? sanitizeTextInput(body.reason) : undefined;

    const blocked = await establishmentService.blockEstablishment(id, user, reason);
    return NextResponse.json({ establishment: blocked });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao bloquear estabelecimento.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
