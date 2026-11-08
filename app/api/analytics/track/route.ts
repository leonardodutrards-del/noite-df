import { NextRequest, NextResponse } from 'next/server';
import { insertRow } from '@/lib/supabase-rest';
import { checkAuthRateLimit, requestIp } from '@/lib/security-rate-limit';

const allowed = new Set([
  'page_view',
  'place_view',
  'map_click',
  'whatsapp_click',
  'instagram_click',
  'favorite',
  'share',
  'search',
  'trial_start',
  'subscription_checkout',
]);

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > 8192) return NextResponse.json({ error: 'Evento muito grande.' }, { status: 413 });
  const rawBody = await request.text();
  if (rawBody.length > 8192) return NextResponse.json({ error: 'Evento muito grande.' }, { status: 413 });
  let event: null | Record<string, unknown>;
  try { event = JSON.parse(rawBody) as null | Record<string, unknown>; }
  catch { return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 }); }
  if (!event || typeof event.name !== 'string' || !allowed.has(event.name)) {
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  }

  const properties =
    event.properties && typeof event.properties === 'object' && !Array.isArray(event.properties)
      ? (event.properties as Record<string, unknown>)
      : {};
  if (JSON.stringify(properties).length > 4096) {
    return NextResponse.json({ error: 'Propriedades do evento muito grandes.' }, { status: 400 });
  }

  const rateAllowed = await checkAuthRateLimit({
    ip: requestIp(request.headers),
    email: 'analytics:public',
    limit: 120,
    windowSeconds: 60,
  });
  if (!rateAllowed) return NextResponse.json({ error: 'Muitos eventos em pouco tempo.' }, { status: 429 });

  const establishmentId =
    typeof event.establishmentId === 'string'
      ? event.establishmentId
      : typeof properties.establishmentId === 'string'
        ? properties.establishmentId
        : typeof properties.placeId === 'string'
          ? properties.placeId
          : null;
  const safeEstablishmentId = establishmentId?.slice(0, 120) ?? null;

  const actionMap: Record<string, string> = {
    page_view: 'view',
    place_view: 'view',
    favorite: 'save',
    share: 'view',
    trial_start: 'view',
    subscription_checkout: 'view',
  };

  try {
    const result = await insertRow('interactions', {
      anonymous_session_id:
        typeof event.sessionId === 'string' ? event.sessionId.slice(0, 120) : null,
      establishment_id: safeEstablishmentId,
      event_id: typeof event.eventId === 'string' ? event.eventId.slice(0, 120) : null,
      action: actionMap[event.name] ?? event.name,
      metadata: {
        eventName: event.name,
        path: typeof event.path === 'string' ? event.path.slice(0, 300) : null,
        source: typeof event.source === 'string' ? event.source.slice(0, 40) : 'web',
        properties,
      },
    });
    return NextResponse.json({ accepted: true, persisted: result.persisted }, { status: 202 });
  } catch (error) {
    console.error('[analytics]', error);
    return NextResponse.json({ error: 'Não foi possível registrar o evento.' }, { status: 500 });
  }
}
