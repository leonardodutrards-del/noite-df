import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

type FavoriteRow = { establishment_id: string; created_at: string };

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const rows = await supabaseAdminJson<FavoriteRow[]>(
      `user_favorites?profile_id=eq.${encodeURIComponent(user.id)}&select=establishment_id,created_at&order=created_at.desc`
    );
    const places = (await Promise.all(rows.map((row) => establishmentService.getById(row.establishment_id)))).filter(Boolean);
    return NextResponse.json({ favorites: places });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao carregar favoritos.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as { establishmentId?: string };
    if (!body.establishmentId || !(await establishmentService.getById(body.establishmentId))) {
      return NextResponse.json({ error: 'Estabelecimento inválido.' }, { status: 400 });
    }
    const response = await supabaseAdminRequest('user_favorites?on_conflict=profile_id,establishment_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ profile_id: user.id, establishment_id: body.establishmentId }),
    });
    if (!response.ok) throw new Error('FAVORITE_SAVE_FAILED');
    return NextResponse.json({ saved: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao salvar favorito.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as { establishmentId?: string };
    if (!body.establishmentId) return NextResponse.json({ error: 'Estabelecimento inválido.' }, { status: 400 });
    const response = await supabaseAdminRequest(
      `user_favorites?profile_id=eq.${encodeURIComponent(user.id)}&establishment_id=eq.${encodeURIComponent(body.establishmentId)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('FAVORITE_DELETE_FAILED');
    return NextResponse.json({ saved: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao remover favorito.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
