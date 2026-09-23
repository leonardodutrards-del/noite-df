import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { getPartnerAnalytics } from '@/modules/analytics/service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const requestedId = request.nextUrl.searchParams.get('establishmentId');
    const establishmentId =
      user.role === 'admin' ? requestedId || user.establishmentId : user.establishmentId;

    if (!establishmentId) {
      return NextResponse.json({ error: 'Estabelecimento não associado.' }, { status: 400 });
    }

    const daysParam = Number(request.nextUrl.searchParams.get('days') || 30);
    const analytics = await getPartnerAnalytics(user, establishmentId, daysParam);
    return NextResponse.json({ analytics });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar métricas.';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível carregar as métricas.' }, { status: 500 });
  }
}
