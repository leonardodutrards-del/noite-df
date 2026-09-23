import { NextRequest, NextResponse } from 'next/server';
import { insertRow } from '@/lib/supabase-rest';

const allowed = new Set([
  'page_view',
  'place_view',
  'map_click',
  'whatsapp_click',
  'instagram_click',
  'favorite',
  'share',
  'search',
]);

export async function POST(request: NextRequest) {
  const event = (await request.json().catch(() => null)) as null | Record<string, unknown>;
  if (!event || typeof event.name !== 'string' || !allowed.has(event.name)) {
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  }

  const properties =
    event.properties && typeof event.properties === 'object'
      ? (event.properties as Record<string, unknown>)
      : {};

  const establishmentId =
    typeof event.establishmentId === 'string'
      ? event.establishmentId
      : typeof properties.establishmentId === 'string'
        ? properties.establishmentId
        : typeof properties.placeId === 'string'
          ? properties.placeId
          : null;

  const actionMap: Record<string, string> = {
    page_view: 'view',
    place_view: 'view',
    favorite: 'save',
    share: 'view',
  };

  try {
    const result = await insertRow('interactions', {
      anonymous_session_id:
        typeof event.sessionId === 'string' ? event.sessionId.slice(0, 120) : null,
      establishment_id: establishmentId,
      event_id: typeof event.eventId === 'string' ? event.eventId : null,
      action: actionMap[event.name] ?? event.name,
      metadata: {
        path: event.path ?? null,
        source: event.source ?? 'web',
        properties,
      },
    });
    return NextResponse.json({ accepted: true, persisted: result.persisted }, { status: 202 });
  } catch (error) {
    console.error('[analytics]', error);
    return NextResponse.json({ error: 'Não foi possível registrar o evento.' }, { status: 500 });
  }
}
