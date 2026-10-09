import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { authService } from '@/modules/auth/service';
import { establishmentService } from '@/modules/establishments/service';
import { validateEditorialEvent } from '@/modules/events/editorial';
import { findEditorialEvent, listEditorialEvents, saveEditorialEvent } from '@/modules/events/store';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const status = message === 'UNAUTHORIZED' ? 401 : message.startsWith('FORBIDDEN') ? 403 : message === 'EVENT_NOT_FOUND' ? 404 : message === 'EVENT_CONFLICT' ? 409 : message === 'INVALID_EVENT' ? 400 : 503;
  const messages: Record<number, string> = {
    401: 'Entre na sua conta.', 403: 'Acesso restrito ao Master Admin.', 404: 'Evento não encontrado.',
    409: 'O evento mudou em outra sessão. Recarregue antes de salvar.',
    400: 'Confira os dados e as datas. Para publicar, confirme a fonte oficial e o uso da imagem. O flyer precisa de link HTTPS, descrição, crédito e fonte.',
    503: 'Não foi possível acessar a agenda. Tente novamente.',
  };
  return NextResponse.json({ error: messages[status] }, { status });
}

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    return NextResponse.json({ events: await listEditorialEvents() });
  } catch (error) { return errorResponse(error); }
}

async function save(request: NextRequest, editing: boolean) {
  try {
    const actor = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));
    const row = validateEditorialEvent(body);
    const place = await establishmentService.getById(row.establishment_id, actor);
    if (!place || (row.publication_status === 'published' && place.publicationStatus !== 'published')) throw new Error('INVALID_EVENT');
    let before = null;
    if (editing) {
      if (typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) throw new Error('INVALID_EVENT');
      before = await findEditorialEvent(body.id);
      if (!before) throw new Error('EVENT_NOT_FOUND');
      if (body.expectedUpdatedAt !== before.updated_at) throw new Error('EVENT_CONFLICT');
    }
    const duplicate = (await listEditorialEvents()).some(event => event.id !== before?.id && event.establishment_id === row.establishment_id && Date.parse(event.starts_at) === Date.parse(row.starts_at) && event.title.trim().toLocaleLowerCase() === row.title.toLocaleLowerCase());
    if (duplicate) throw new Error('EVENT_CONFLICT');
    const event = await saveEditorialEvent({ ...row, updated_by: actor.id, ...(!before ? { created_by: actor.id } : {}) }, before ?? undefined);
    await authService.logAudit({ actorId: actor.id, actorEmail: actor.email, actorRole: actor.role,
      action: before ? 'update_event' : 'create_event', entityType: 'event', entityId: event.id,
      beforeData: before ?? undefined, afterData: event });
    return NextResponse.json({ event }, { status: editing ? 200 : 201 });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) { return save(request, false); }
export async function PATCH(request: NextRequest) { return save(request, true); }
