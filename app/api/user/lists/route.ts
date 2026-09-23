import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

type ListRow = { id: string; name: string; created_at: string };
type ItemRow = { list_id: string; establishment_id: string };

async function ownedList(profileId: string, listId: string) {
  const rows = await supabaseAdminJson<ListRow[]>(
    `saved_lists?id=eq.${encodeURIComponent(listId)}&profile_id=eq.${encodeURIComponent(profileId)}&select=id,name,created_at`
  );
  return rows[0] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const lists = await supabaseAdminJson<ListRow[]>(
      `saved_lists?profile_id=eq.${encodeURIComponent(user.id)}&select=id,name,created_at&order=created_at.desc`
    );
    const ids = lists.map((list) => list.id);
    const items = ids.length
      ? await supabaseAdminJson<ItemRow[]>(
          `saved_list_items?list_id=in.(${ids.map(encodeURIComponent).join(',')})&select=list_id,establishment_id`
        )
      : [];
    return NextResponse.json({ lists, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao carregar roteiros.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
      if (!name) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 });
      const response = await supabaseAdminRequest('saved_lists', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ profile_id: user.id, name }),
      });
      if (!response.ok) throw new Error('LIST_CREATE_FAILED');
      const rows = (await response.json()) as ListRow[];
      return NextResponse.json({ list: rows[0] }, { status: 201 });
    }

    if (action === 'add_item') {
      const listId = typeof body.listId === 'string' ? body.listId : '';
      const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId : '';
      if (!listId || !establishmentId || !(await ownedList(user.id, listId)) || !(await establishmentService.getById(establishmentId))) {
        return NextResponse.json({ error: 'Roteiro ou estabelecimento inválido.' }, { status: 400 });
      }
      const response = await supabaseAdminRequest('saved_list_items?on_conflict=list_id,establishment_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ list_id: listId, establishment_id: establishmentId }),
      });
      if (!response.ok) throw new Error('LIST_ITEM_SAVE_FAILED');
      return NextResponse.json({ saved: true });
    }

    if (action === 'remove_item') {
      const listId = typeof body.listId === 'string' ? body.listId : '';
      const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId : '';
      if (!listId || !establishmentId || !(await ownedList(user.id, listId))) {
        return NextResponse.json({ error: 'Roteiro inválido.' }, { status: 400 });
      }
      const response = await supabaseAdminRequest(
        `saved_list_items?list_id=eq.${encodeURIComponent(listId)}&establishment_id=eq.${encodeURIComponent(establishmentId)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('LIST_ITEM_DELETE_FAILED');
      return NextResponse.json({ saved: false });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao atualizar roteiro.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const listId = request.nextUrl.searchParams.get('listId') ?? '';
    if (!listId || !(await ownedList(user.id, listId))) {
      return NextResponse.json({ error: 'Roteiro inválido.' }, { status: 400 });
    }
    const response = await supabaseAdminRequest(
      `saved_lists?id=eq.${encodeURIComponent(listId)}&profile_id=eq.${encodeURIComponent(user.id)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('LIST_DELETE_FAILED');
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao remover roteiro.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
