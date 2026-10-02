import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'Este fluxo foi substituído pelo checkout autenticado.',
      code: 'AUTHENTICATED_CHECKOUT_REQUIRED',
    },
    { status: 410 }
  );
}
