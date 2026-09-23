import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAndSyncMercadoPagoResource,
  recordWebhookEvent,
  validateMercadoPagoSignature,
  webhookEventAlreadyProcessed,
  type MercadoPagoWebhookBody,
} from '@/lib/mercado-pago';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as MercadoPagoWebhookBody;
  const dataId =
    request.nextUrl.searchParams.get('data.id') ??
    (body.data?.id !== undefined ? String(body.data.id) : null);
  const requestId = request.headers.get('x-request-id');

  if (
    !dataId ||
    !validateMercadoPagoSignature({
      xSignature: request.headers.get('x-signature'),
      xRequestId: requestId,
      dataId,
    })
  ) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  const providerEventId =
    body.id !== undefined ? String(body.id) : `${body.type ?? 'unknown'}:${dataId}:${requestId ?? ''}`;

  try {
    if (await webhookEventAlreadyProcessed(providerEventId)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await fetchAndSyncMercadoPagoResource(body.type, dataId);
    await recordWebhookEvent(providerEventId, body, true);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[mercado-pago-webhook]', error);
    return NextResponse.json({ error: 'Falha ao processar notificação.' }, { status: 500 });
  }
}
