import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest, isMasterAdminUser } from '@/modules/auth/session';

export async function GET(request: NextRequest) {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ user, isMasterAdmin: isMasterAdminUser(user) });
}
