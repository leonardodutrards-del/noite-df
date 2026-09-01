import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { paymentAdminService } from '@/modules/payments/service';
import { sanitizeTextInput } from '@/lib/security';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? sanitizeTextInput(body.reason) : 'Reembolso solicitado e aprovado no painel master';

    const refunded = await paymentAdminService.refund(id, reason, user);
    return NextResponse.json({ payment: refunded });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao processar reembolso.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
