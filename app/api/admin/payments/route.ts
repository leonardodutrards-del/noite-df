import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { paymentAdminService } from '@/modules/payments/service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireMasterAdmin(request);
    const payments = await paymentAdminService.listAll(user);
    return NextResponse.json({ payments });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao listar pagamentos.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
