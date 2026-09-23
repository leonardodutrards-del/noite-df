import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { getMasterOverview } from '@/modules/admin/overview';

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const overview = await getMasterOverview();
    return NextResponse.json({ overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar visão geral.';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (message.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    }
    console.error('master-overview', error);
    return NextResponse.json({ error: 'Não foi possível carregar a visão geral.' }, { status: 500 });
  }
}
