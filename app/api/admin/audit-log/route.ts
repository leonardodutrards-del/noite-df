import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { authService } from '@/modules/auth/service';

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const auditLogs = await authService.getAuditLogs(100);
    return NextResponse.json({ auditLogs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao obter logs de auditoria.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
