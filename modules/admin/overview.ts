import { mercadoPagoGet, syncPaymentResource } from '@/lib/mercado-pago';
export type MasterOverview = {
  generatedAt: string;
  users: number;
  establishments: number;
  publishedEstablishments: number;
  suspendedEstablishments: number;
  pendingClaims: number;
  activeSubscriptions: number;
  monthlyRecurringRevenueCents: number;
  interactions30d: number;
  interactions24h: number;
  views30d: number;
  views24h: number;
  whatsappClicks30d: number;
  whatsappClicks24h: number;
  mapClicks30d: number;
  instagramClicks30d: number;
  favorites30d: number;
  checkoutStarts30d: number;
  trialStarts30d: number;
  auditEvents: number;
};

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

async function request(path: string, init: RequestInit = {}) {
  const cfg = config();
  if (!cfg) throw new Error('SUPABASE_NOT_CONFIGURED');
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}

function parseCount(response: Response): number {
  const range = response.headers.get('content-range');
  if (!range) return 0;
  const total = range.split('/')[1];
  return total && total !== '*' ? Number(total) || 0 : 0;
}

async function countRows(table: string, filter = ''): Promise<number> {
  const suffix = filter ? `&${filter}` : '';
  const response = await request(`${table}?select=id${suffix}`, {
    method: 'GET',
    headers: {
      Prefer: 'count=exact',
      Range: '0-0',
    },
  });
  if (!response.ok) throw new Error(`MASTER_OVERVIEW_${table.toUpperCase()}_FAILED`);
  return parseCount(response);
}

async function reconcilePendingPixPayments(): Promise<void> {
  const response = await request(
    'subscription_accounts?provider=eq.mercado_pago_pix&status=eq.pending&provider_payment_id=not.is.null&select=provider_payment_id&order=updated_at.desc&limit=20'
  );
  if (!response.ok) return;

  const rows = (await response.json()) as Array<{ provider_payment_id: string | null }>;
  for (const row of rows) {
    if (!row.provider_payment_id) continue;
    try {
      const payment = await mercadoPagoGet<{
        id: string | number;
        status?: string;
        external_reference?: string;
        payer?: { email?: string };
        transaction_amount?: number;
        date_approved?: string;
      }>(`/v1/payments/${encodeURIComponent(row.provider_payment_id)}`);
      await syncPaymentResource(payment);
    } catch (error) {
      console.error('master-overview-pix-reconcile', row.provider_payment_id, error);
    }
  }
}

export async function getMasterOverview(): Promise<MasterOverview> {
  const cfg = config();
  if (!cfg) {
    return {
      generatedAt: new Date().toISOString(),
      users: 0,
      establishments: 0,
      publishedEstablishments: 0,
      suspendedEstablishments: 0,
      pendingClaims: 0,
      activeSubscriptions: 0,
      monthlyRecurringRevenueCents: 0,
      interactions30d: 0,
      interactions24h: 0,
      views30d: 0,
      views24h: 0,
      whatsappClicks30d: 0,
      whatsappClicks24h: 0,
      mapClicks30d: 0,
      instagramClicks30d: 0,
      favorites30d: 0,
      checkoutStarts30d: 0,
      trialStarts30d: 0,
      auditEvents: 0,
    };
  }

  await reconcilePendingPixPayments();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since24h = Date.now() - 24 * 60 * 60 * 1000;

  const [
    users,
    establishments,
    publishedEstablishments,
    suspendedEstablishments,
    pendingClaims,
    activeSubscriptions,
    auditEvents,
    subscriptionResponse,
    interactionsResponse,
  ] = await Promise.all([
    countRows('profiles'),
    countRows('establishments'),
    countRows('establishments', 'publication_status=eq.published'),
    countRows('establishments', 'publication_status=eq.suspended'),
    countRows('partner_claims', 'status=eq.pending'),
    countRows('subscription_accounts', 'status=eq.active'),
    countRows('audit_log'),
    request('subscription_accounts?status=eq.active&provider=eq.mercado_pago&select=amount_cents'),
    request(
      `interactions?created_at=gte.${encodeURIComponent(since)}&select=action,created_at`
    ),
  ]);

  if (!subscriptionResponse.ok) throw new Error('MASTER_OVERVIEW_SUBSCRIPTIONS_FAILED');
  if (!interactionsResponse.ok) throw new Error('MASTER_OVERVIEW_INTERACTIONS_FAILED');

  const subscriptions = (await subscriptionResponse.json()) as Array<{ amount_cents?: number }>;
  const interactions = (await interactionsResponse.json()) as Array<{ action: string; created_at: string }>;

  let interactions24h = 0;
  let views30d = 0;
  let views24h = 0;
  let whatsappClicks30d = 0;
  let whatsappClicks24h = 0;
  let mapClicks30d = 0;
  let instagramClicks30d = 0;
  let favorites30d = 0;
  let checkoutStarts30d = 0;
  let trialStarts30d = 0;

  for (const row of interactions) {
    const is24h = Date.parse(row.created_at) >= since24h;
    if (is24h) interactions24h += 1;
    if (row.action === 'view') {
      views30d += 1;
      if (is24h) views24h += 1;
    }
    if (row.action === 'whatsapp_click') {
      whatsappClicks30d += 1;
      if (is24h) whatsappClicks24h += 1;
    }
    if (row.action === 'map_click') mapClicks30d += 1;
    if (row.action === 'instagram_click') instagramClicks30d += 1;
    if (row.action === 'save') favorites30d += 1;
    if (row.action === 'subscription_checkout') checkoutStarts30d += 1;
    if (row.action === 'trial_start') trialStarts30d += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    users,
    establishments,
    publishedEstablishments,
    suspendedEstablishments,
    pendingClaims,
    activeSubscriptions,
    monthlyRecurringRevenueCents: subscriptions.reduce(
      (total, item) => total + Number(item.amount_cents ?? 0),
      0
    ),
    interactions30d: interactions.length,
    interactions24h,
    views30d,
    views24h,
    whatsappClicks30d,
    whatsappClicks24h,
    mapClicks30d,
    instagramClicks30d,
    favorites30d,
    checkoutStarts30d,
    trialStarts30d,
    auditEvents,
  };
}
