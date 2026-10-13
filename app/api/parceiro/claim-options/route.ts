import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const places = await establishmentService.search({});
    return NextResponse.json({ places: places.filter(p => p.publicationStatus === 'published').map(p => ({ id: p.id, name: p.name, region: p.region, address: p.address, type: p.type })).sort((a,b) => a.name.localeCompare(b.name, 'pt-BR')) });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: unauthorized ? 'Faça login para selecionar seu local.' : 'Não foi possível carregar os locais.' }, { status: unauthorized ? 401 : 503 });
  }
}
