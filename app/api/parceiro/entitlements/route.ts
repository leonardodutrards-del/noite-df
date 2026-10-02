import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import {
  adminEntitlements,
  getEstablishmentEntitlements,
} from '@/modules/payments/entitlements';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const requestedId = request.nextUrl.searchParams.get('establishmentId');
    const establishmentId =
      (user.role === 'admin' || user.role === 'master_admin') ? requestedId || user.establishmentId : user.establishmentId;

    if (user.role !== 'partner' && user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Vincule um estabelecimento antes de contratar um plano.', code: 'PARTNER_REQUIRED' },
        { status: 403 }
      );
    }

    if (!establishmentId) {
      return NextResponse.json(
        { error: 'Nenhum estabelecimento associado a esta conta.', code: 'ESTABLISHMENT_REQUIRED' },
        { status: 400 }
      );
    }

    const entitlements =
      (user.role === 'admin' || user.role === 'master_admin')
        ? adminEntitlements(establishmentId)
        : await getEstablishmentEntitlements(establishmentId);

    return NextResponse.json({ entitlements });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Não foi possível carregar os benefícios do plano.' }, { status: 500 });
  }
}
