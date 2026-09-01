import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificação não fornecido.' },
        { status: 400 }
      );
    }

    const result = await authService.verifyToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      );
    }

    // Se for login, retornar usuário e token
    if (result.user && result.token) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
        },
        { status: 200 }
      );
    }

    // Se for signup, apenas confirmar verificação
    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao verificar token.';
    console.error('Error during token verification:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
