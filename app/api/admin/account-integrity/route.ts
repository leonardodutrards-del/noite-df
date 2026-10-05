import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { getAccountIntegrity } from '@/modules/admin/account-integrity';

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const integrity = await getAccountIntegrity();
    return NextResponse.json({ integrity });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (message.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    }
    console.error('account-integrity', error);
    return NextResponse.json(
      { error: 'Não foi possível verificar a integridade das contas.' },
      { status: 500 }
    );
  }
}
