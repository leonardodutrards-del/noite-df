import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import type { VisitorLoginInput } from '@/modules/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VisitorLoginInput;

    if (!body.email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório.' },
        { status: 400 }
      );
    }

    await authService.visitorLogin(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Se o e-mail está cadastrado, você receberá um link de verificação em breve.',
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao solicitar link de verificação.';

    if (message.includes('não encontrado')) {
      return NextResponse.json(
        { error: 'Se o e-mail está cadastrado, você receberá um link de verificação em breve.' },
        { status: 200 } // Retornar 200 mesmo quando não encontrado, por segurança
      );
    }

    console.error('Error during visitor login request:', error);
    return NextResponse.json(
      { error: 'Erro ao solicitar link de verificação. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
