import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { getCommercialHealth } from '@/modules/admin/commercial-health';

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const health = await getCommercialHealth();
    return NextResponse.json({ health });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (message.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    }
    console.error('commercial-health', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar o acompanhamento comercial.' },
      { status: 500 }
    );
  }
}
