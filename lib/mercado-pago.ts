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
  preapproval_plan_id?: string;
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

export async function createMercadoPagoPixCheckout(args: {
  establishmentId: string;
  planCode: 'pro' | 'premium' | 'enterprise';
  planName: string;
  priceCents: number;
  backUrl: string;
}): Promise<{ id: string; initPoint: string }> {
  const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: `Noite DF ${args.planName}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: args.priceCents / 100,
        currency_id: 'BRL',
      },
      back_url: args.backUrl,
    }),
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (
    !response.ok ||
    typeof data.id !== 'string' ||
    typeof data.init_point !== 'string' ||
    !data.init_point
  ) {
    console.error('mercado-pago-create-pix-checkout', {
      status: response.status,
      data,
    });
    throw new Error(
      typeof data.message === 'string'
        ? `MERCADO_PAGO_PIX_CHECKOUT_CREATE_FAILED:${data.message}`
        : `MERCADO_PAGO_PIX_CHECKOUT_CREATE_FAILED:${response.status}`
    );
  }

  const persisted = await supabase(
    'payment_provider_plans?on_conflict=provider,establishment_id,plan_code,payment_method',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      provider: 'mercado_pago',
      establishment_id: args.establishmentId,
      plan_code: args.planCode,
      payment_method: 'pix',
      provider_plan_id: data.id,
      amount_cents: args.priceCents,
      checkout_url: data.init_point,
        updated_at: new Date().toISOString(),
      }),
    }
  );
  if (!persisted.ok) {
    console.error('pix-plan-persist', { status: persisted.status });
    throw new Error('PIX_PLAN_PERSIST_FAILED');
  }

  return { id: data.id, initPoint: data.init_point };
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

async function syncCommercialPipeline(establishmentId: string, subscriptionStatus: string, now: string) {
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'cancelled') return;

  const response = await supabase('partner_pipeline?on_conflict=establishment_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      establishment_id: establishmentId,
      stage: subscriptionStatus === 'active' ? 'partner' : 'paused',
      contact_channel: 'mercado_pago',
      next_follow_up_at: null,
      ...(subscriptionStatus === 'active'
        ? {
            subscription_consent_at: now,
            visit_status: 'signed',
            visited_at: now,
          }
        : {}),
      updated_at: now,
    }),
  });
  if (!response.ok) throw new Error('SUBSCRIPTION_PIPELINE_SYNC_FAILED');
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

async function resolveSubscriptionReference(resource: SubscriptionResource) {
  const fromExternalReference = parseReference(resource.external_reference);
  if (fromExternalReference) return fromExternalReference;
  if (!resource.preapproval_plan_id) return null;

  const response = await supabase(
    `payment_provider_plans?provider=eq.mercado_pago&provider_plan_id=eq.${encodeURIComponent(resource.preapproval_plan_id)}&select=establishment_id,plan_code&limit=1`
  );
  if (!response.ok) throw new Error('SUBSCRIPTION_PLAN_REFERENCE_LOOKUP_FAILED');
  const rows = (await response.json()) as Array<{
    establishment_id: string;
    plan_code: string;
  }>;
  const row = rows[0];
  if (!row || !['pro', 'premium', 'enterprise'].includes(row.plan_code)) return null;
  return { establishmentId: row.establishment_id, planCode: row.plan_code };
}

export async function syncSubscriptionResource(resource: SubscriptionResource): Promise<void> {
  const cfg = supabaseConfig();
  if (!cfg) return;
  const reference = await resolveSubscriptionReference(resource);
  if (!reference) throw new Error('SUBSCRIPTION_REFERENCE_INVALID');

  const now = new Date().toISOString();
  const amountCents = Math.round((resource.auto_recurring?.transaction_amount ?? 0) * 100);
  const subscriptionStatus = mapSubscriptionStatus(resource.status);
  const lookup = await supabase(
    `subscription_accounts?provider_subscription_id=eq.${encodeURIComponent(resource.id)}&select=id,current_period_end`
  );
  if (!lookup.ok) throw new Error('SUBSCRIPTION_LOOKUP_FAILED');
  const existing = (await lookup.json()) as Array<{ id: string; current_period_end: string | null }>;

  if (existing.length > 0) {
    const updated = await supabase(
      `subscription_accounts?id=eq.${encodeURIComponent(existing[0].id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          establishment_id: reference.establishmentId,
          plan_code: reference.planCode,
          payer_email: resource.payer_email ?? '',
          status: subscriptionStatus,
          amount_cents: amountCents,
          current_period_end: resource.next_payment_date ?? existing[0].current_period_end ?? null,
          updated_at: now,
        }),
      }
    );
    if (!updated.ok) throw new Error('SUBSCRIPTION_UPDATE_FAILED');
    await syncCommercialPipeline(reference.establishmentId, subscriptionStatus, now);
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
      status: subscriptionStatus,
      amount_cents: amountCents,
      current_period_end: resource.next_payment_date ?? null,
      created_at: now,
      updated_at: now,
    }),
  });
  if (!created.ok) throw new Error('SUBSCRIPTION_CREATE_FAILED');
  await syncCommercialPipeline(reference.establishmentId, subscriptionStatus, now);
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
