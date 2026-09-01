import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import type { SignUpVisitorInput } from '@/modules/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SignUpVisitorInput;

    // Validate required fields
    if (!body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Email e telefone são obrigatórios.' },
        { status: 400 }
      );
    }

    // At least one consent channel must be selected
    if (!body.consentEmail && !body.consentWhatsapp) {
      return NextResponse.json(
        { error: 'Você deve aceitar pelo menos um canal de comunicação.' },
        { status: 400 }
      );
    }

    const result = await authService.signUpVisitor(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar conta.';

    // Check for specific error messages
    if (message.includes('já está cadastrado')) {
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }

    if (message.includes('inválido') || message.includes('obrigatório')) {
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    console.error('Error during visitor signup:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
