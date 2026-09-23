import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { partnershipService } from '@/modules/partnerships/service';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireMasterAdmin(request);
    const claims = await partnershipService.listClaims(admin);
    return NextResponse.json({ claims });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar solicitações.';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
