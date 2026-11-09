import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { validateEditorialEvent } from '@/modules/events/editorial';
import { findEditorialEvent, listEditorialEvents, saveEditorialEvent } from '@/modules/events/store';
import { supabaseAdminJson } from '@/lib/supabase-admin';

type Candidate = {
  id: string;
  connector_id: string;
  normalized_payload: Record<string, unknown>;
  source_url: string;
  status: string;
  event_id: string | null;
};

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const status = message === 'UNAUTHORIZED' ? 401 : message.startsWith('FORBIDDEN') ? 403 :
    message === 'CANDIDATE_NOT_FOUND' ? 404 : message === 'INVALID_EVENT' ? 400 :
    message === 'EVENT_CONFLICT' || message === 'CANDIDATE_PROCESSING' ? 409 : 503;
  const messages: Record<number, string> = {
    401: 'Entre na sua conta.',
    403: 'Acesso restrito ao Master Admin.',
    404: 'Evento candidato não encontrado.',
    400: 'O evento ainda não tem informações suficientes ou a fonte/imagem precisa de validação.',
    409: message === 'CANDIDATE_PROCESSING'
      ? 'Este evento já está em processamento ou precisa ser revisado novamente. Atualize a fila e tente depois.'
      : 'Já existe um evento equivalente. Revise a agenda antes de aprovar.',
    503: 'Não foi possível processar a revisão.',
  };
  return NextResponse.json({ error: messages[status] }, { status });
}

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const [candidates, runs] = await Promise.all([
      supabaseAdminJson<Candidate[]>(
        'event_candidates?select=*&status=eq.pending_review&order=confidence.desc,first_seen_at.asc&limit=100'
      ),
      supabaseAdminJson<Array<Record<string, unknown>>>(
        'event_ingestion_runs?select=*&order=started_at.desc&limit=20'
      ),
    ]);
    return NextResponse.json({ candidates, runs });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    const action = body.action;
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '';
    if (!/^[0-9a-f-]{36}$/i.test(id) || !['approve', 'reject'].includes(action)) {
      throw new Error('INVALID_EVENT');
    }

    const candidates = await supabaseAdminJson<Candidate[]>(
      `event_candidates?id=eq.${id}&status=eq.pending_review&limit=1`
    );
    const candidate = candidates[0];
    if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');

    if (action === 'reject') {
      const updated = await supabaseAdminJson<Array<Record<string, unknown>>>(`event_candidates?id=eq.${id}&status=eq.pending_review`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          status: 'rejected', reviewed_at: new Date().toISOString(),
          reviewed_by: actor.id, review_note: note || 'Rejeitado na revisão editorial.',
          updated_at: new Date().toISOString(),
        }),
      });
      if (!updated.length) throw new Error('CANDIDATE_PROCESSING');
      await authService.logAudit({
        actorId: actor.id, actorEmail: actor.email, actorRole: actor.role,
        action: 'reject_event_candidate', entityType: 'event_candidate', entityId: id,
        afterData: updated[0] ?? { status: 'rejected' },
      });
      return NextResponse.json({ candidate: updated[0] });
    }

    const claimRows = await supabaseAdminJson<Array<{
      candidate_status: string;
      candidate_event_id: string | null;
      claimed: boolean;
    }>>('rpc/claim_event_candidate_for_approval', {
      method: 'POST',
      body: JSON.stringify({ p_candidate_id: id, p_actor_id: actor.id }),
    });
    const claim = claimRows[0];
    if (!claim || claim.candidate_status === 'not_found') throw new Error('CANDIDATE_NOT_FOUND');
    if (claim.candidate_status === 'published' && claim.candidate_event_id) {
      const published = await findEditorialEvent(claim.candidate_event_id);
      if (published) return NextResponse.json({ event: published, candidate: { ...candidate, status: 'published', event_id: published.id } });
      throw new Error('CANDIDATE_PROCESSING');
    }
    if (!claim.claimed) throw new Error('CANDIDATE_PROCESSING');

    const connectors = await supabaseAdminJson<Array<{ data_source_id: string }>>(
      `event_source_connectors?id=eq.${candidate.connector_id}&limit=1`
    );
    const sourceId = connectors[0]?.data_source_id;
    if (!sourceId) throw new Error('INVALID_EVENT');
    const sources = await supabaseAdminJson<Array<{ entity_id: string; source_kind: string; verified_at: string | null }>>(
      `data_sources?id=eq.${sourceId}&entity_type=eq.establishment&source_kind=eq.official&select=entity_id,source_kind,verified_at&limit=1`
    );
    const source = sources[0];
    if (!source?.verified_at) throw new Error('INVALID_EVENT');

    const normalized = candidate.normalized_payload;
    const eventInput = {
      establishment_id: normalized.establishmentId,
      title: normalized.title,
      category: normalized.category || 'Evento',
      description: normalized.description,
      starts_at: normalized.startsAt,
      ends_at: normalized.endsAt,
      price_description: normalized.priceDescription,
      official_url: normalized.officialUrl || candidate.source_url,
      publication_status: 'published',
      sourceConfirmed: true,
      ...(body.event && typeof body.event === 'object' ? body.event : {}),
    } as Record<string, unknown>;

    if (eventInput.establishment_id !== source.entity_id) throw new Error('INVALID_EVENT');
    const validated = validateEditorialEvent(eventInput);
    const place = await establishmentService.getById(String(validated.establishment_id), actor);
    if (!place || place.publicationStatus !== 'published') throw new Error('INVALID_EVENT');

    const existing = claim.candidate_event_id
      ? await findEditorialEvent(claim.candidate_event_id)
      : candidate.event_id ? await findEditorialEvent(candidate.event_id) : null;
    const matchingEvent = existing ?? (await listEditorialEvents()).find((event) =>
      event.establishment_id === validated.establishment_id &&
      Date.parse(event.starts_at) === Date.parse(validated.starts_at) &&
      event.title.trim().toLocaleLowerCase() === String(validated.title).toLocaleLowerCase()
    ) ?? null;
    if (matchingEvent) {
      const linked = await supabaseAdminJson<Array<Record<string, unknown>>>(`event_candidates?id=eq.${id}&status=eq.approved`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          status: 'published', event_id: matchingEvent.id, reviewed_at: new Date().toISOString(),
          reviewed_by: actor.id, review_note: note || 'Aprovação retomada e vinculada ao evento já existente.',
          updated_at: new Date().toISOString(),
        }),
      });
      if (!linked.length) throw new Error('CANDIDATE_PROCESSING');
      return NextResponse.json({ event: matchingEvent, candidate: linked[0] });
    }

    const event = await saveEditorialEvent({
      ...validated,
      created_by: existing ? undefined : actor.id,
      updated_by: actor.id,
    }, existing ?? undefined);

    const updated = await supabaseAdminJson<Array<Record<string, unknown>>>(`event_candidates?id=eq.${id}&status=eq.approved`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        status: 'published', event_id: event.id, reviewed_at: new Date().toISOString(),
        reviewed_by: actor.id, review_note: note || 'Aprovado e publicado pelo Master Admin.',
        updated_at: new Date().toISOString(),
      }),
    });
    if (!updated.length) throw new Error('CANDIDATE_PROCESSING');
    await authService.logAudit({
      actorId: actor.id, actorEmail: actor.email, actorRole: actor.role,
      action: 'publish_event_candidate', entityType: 'event', entityId: event.id,
      afterData: event as unknown as Record<string, unknown>,
      details: { candidateId: id, sourceUrl: candidate.source_url },
    });
    return NextResponse.json({ event, candidate: updated[0] }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
