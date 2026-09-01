import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { requireAuth } from '@/modules/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'visitor') {
      return NextResponse.json(
        { error: 'Apenas visitantes podem revogar consentimento.' },
        { status: 403 }
      );
    }

    await authService.revokeConsent(user.id);

    return NextResponse.json(
      { message: 'Consentimento revogado com sucesso.' },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao revogar consentimento.';

    if (message.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    console.error('Error during consent revocation:', error);
    return NextResponse.json(
      { error: 'Erro ao revogar consentimento. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
