import crypto from 'crypto';

export type MercadoPagoWebhookBody = {
  id?: string | number;
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

type SubscriptionResource = {
  id: string;
  status?: string;
  external_reference?: string;
  payer_email?: string;
  next_payment_date?: string;
  auto_recurring?: { transaction_amount?: number };
};

type PaymentResource = {
  id: number | string;
  status?: string;
  external_reference?: string;
  payer?: { email?: string };
  transaction_amount?: number;
  date_approved?: string;
};

function accessToken(): string {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADO_PAGO_NOT_CONFIGURED');
  return token;
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function safeEqualHex(a: string, b: string): boolean {
  if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b)) return false;
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function validateMercadoPagoSignature(args: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret?: string;
}): boolean {
  const secret = args.secret ?? process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret || !args.xSignature) return false;

  const parts = new Map(
    args.xSignature.split(',').map((part) => {
      const [key, ...rest] = part.split('=');
      return [key?.trim(), rest.join('=').trim()];
    })
  );
  const ts = parts.get('ts');
  const signature = parts.get('v1');
  if (!ts || !signature) return false;

  const segments: string[] = [];
  if (args.dataId) segments.push(`id:${args.dataId.toLowerCase()};`);
  if (args.xRequestId) segments.push(`request-id:${args.xRequestId};`);
  segments.push(`ts:${ts};`);

  const manifest = segments.join('');
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return safeEqualHex(expected, signature);
}

export async function mercadoPagoGet<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`MERCADO_PAGO_GET_FAILED_${response.status}`);
  return response.json() as Promise<T>;
}

export async function mercadoPagoRefund(paymentId: string, idempotencyKey: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`MERCADO_PAGO_REFUND_FAILED_${response.status}`);
  return data;
}

async function supabase(path: string, init: RequestInit = {}) {
  const cfg = supabaseConfig();
  if (!cfg) throw new Error('SUPABASE_NOT_CONFIGURED');
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}

function parseReference(reference?: string) {
  if (!reference) return null;
  const [prefix, establishmentId, planCode] = reference.split(':');
  if (prefix !== 'noite-df' || !establishmentId || !planCode) return null;
  if (!['pro', 'premium', 'enterprise'].includes(planCode)) return null;
  return { establishmentId, planCode };
}

function mapSubscriptionStatus(status?: string) {
  if (status === 'authorized') return 'active';
  if (status === 'cancelled' || status === 'canceled' || status === 'paused') return 'cancelled';
  return 'pending';
}

export async function webhookEventAlreadyProcessed(providerEventId: string): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;
  const response = await supabase(
    `payment_webhook_events?provider=eq.mercado_pago&provider_event_id=eq.${encodeURIComponent(providerEventId)}&select=id`
  );
  if (!response.ok) throw new Error('WEBHOOK_IDEMPOTENCY_LOOKUP_FAILED');
  const rows = (await response.json()) as unknown[];
  return rows.length > 0;
}

export async function recordWebhookEvent(
  providerEventId: string,
  body: MercadoPagoWebhookBody,
  processed: boolean
): Promise<void> {
  const cfg = supabaseConfig();
  if (!cfg) return;
  const response = await supabase('payment_webhook_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      provider: 'mercado_pago',
      provider_event_id: providerEventId,
      event_type: body.type ?? body.action ?? 'unknown',
      payload: body,
      processed_at: processed ? new Date().toISOString() : null,
    }),
  });
  if (!response.ok && response.status !== 409) throw new Error('WEBHOOK_EVENT_PERSIST_FAILED');
}

export async function syncSubscriptionResource(resource: SubscriptionResource): Promise<void> {
  const cfg = supabaseConfig();
  if (!cfg) return;
  const reference = parseReference(resource.external_reference);
  if (!reference) throw new Error('SUBSCRIPTION_EXTERNAL_REFERENCE_INVALID');

  const now = new Date().toISOString();
  const amountCents = Math.round((resource.auto_recurring?.transaction_amount ?? 0) * 100);
  const lookup = await supabase(
    `subscription_accounts?provider_subscription_id=eq.${encodeURIComponent(resource.id)}&select=id`
  );
  if (!lookup.ok) throw new Error('SUBSCRIPTION_LOOKUP_FAILED');
  const existing = (await lookup.json()) as Array<{ id: string }>;

  if (existing.length > 0) {
    const updated = await supabase(
      `subscription_accounts?id=eq.${encodeURIComponent(existing[0].id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          establishment_id: reference.establishmentId,
          plan_code: reference.planCode,
          payer_email: resource.payer_email ?? '',
          status: mapSubscriptionStatus(resource.status),
          amount_cents: amountCents,
          current_period_end: resource.next_payment_date ?? null,
          updated_at: now,
        }),
      }
    );
    if (!updated.ok) throw new Error('SUBSCRIPTION_UPDATE_FAILED');
    return;
  }

  const created = await supabase('subscription_accounts', {
    method: 'POST',
    body: JSON.stringify({
      establishment_id: reference.establishmentId,
      plan_code: reference.planCode,
      provider: 'mercado_pago',
      provider_subscription_id: resource.id,
      payer_email: resource.payer_email ?? '',
      status: mapSubscriptionStatus(resource.status),
      amount_cents: amountCents,
      current_period_end: resource.next_payment_date ?? null,
      created_at: now,
      updated_at: now,
    }),
  });
  if (!created.ok) throw new Error('SUBSCRIPTION_CREATE_FAILED');
}

export async function syncPaymentResource(resource: PaymentResource): Promise<void> {
  const cfg = supabaseConfig();
  if (!cfg) return;
  const reference = parseReference(resource.external_reference);
  if (!reference) return;

  const response = await supabase(
    `subscription_accounts?establishment_id=eq.${encodeURIComponent(reference.establishmentId)}&plan_code=eq.${encodeURIComponent(reference.planCode)}&order=updated_at.desc&limit=1&select=id`
  );
  if (!response.ok) throw new Error('PAYMENT_ACCOUNT_LOOKUP_FAILED');
  const rows = (await response.json()) as Array<{ id: string }>;
  if (rows.length === 0) return;

  const updated = await supabase(
    `subscription_accounts?id=eq.${encodeURIComponent(rows[0].id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        provider_payment_id: String(resource.id),
        payer_email: resource.payer?.email ?? undefined,
        amount_cents:
          typeof resource.transaction_amount === 'number'
            ? Math.round(resource.transaction_amount * 100)
            : undefined,
        updated_at: new Date().toISOString(),
      }),
    }
  );
  if (!updated.ok) throw new Error('PAYMENT_ACCOUNT_UPDATE_FAILED');
}

export async function fetchAndSyncMercadoPagoResource(
  type: string | undefined,
  dataId: string
): Promise<void> {
  if (type === 'subscription_preapproval') {
    const resource = await mercadoPagoGet<SubscriptionResource>(
      `/preapproval/${encodeURIComponent(dataId)}`
    );
    await syncSubscriptionResource(resource);
    return;
  }

  if (type === 'payment') {
    const resource = await mercadoPagoGet<PaymentResource>(
      `/v1/payments/${encodeURIComponent(dataId)}`
    );
    await syncPaymentResource(resource);
    return;
  }

  if (type === 'subscription_authorized_payment') {
    await mercadoPagoGet<Record<string, unknown>>(
      `/authorized_payments/${encodeURIComponent(dataId)}`
    );
  }
}
