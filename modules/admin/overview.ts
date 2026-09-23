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
  views30d: number;
  whatsappClicks30d: number;
  mapClicks30d: number;
  instagramClicks30d: number;
  favorites30d: number;
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
      views30d: 0,
      whatsappClicks30d: 0,
      mapClicks30d: 0,
      instagramClicks30d: 0,
      favorites30d: 0,
      auditEvents: 0,
    };
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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
    request('subscription_accounts?status=eq.active&select=amount_cents'),
    request(
      `interactions?created_at=gte.${encodeURIComponent(since)}&select=action`
    ),
  ]);

  if (!subscriptionResponse.ok) throw new Error('MASTER_OVERVIEW_SUBSCRIPTIONS_FAILED');
  if (!interactionsResponse.ok) throw new Error('MASTER_OVERVIEW_INTERACTIONS_FAILED');

  const subscriptions = (await subscriptionResponse.json()) as Array<{ amount_cents?: number }>;
  const interactions = (await interactionsResponse.json()) as Array<{ action: string }>;

  let views30d = 0;
  let whatsappClicks30d = 0;
  let mapClicks30d = 0;
  let instagramClicks30d = 0;
  let favorites30d = 0;

  for (const row of interactions) {
    if (row.action === 'view') views30d += 1;
    if (row.action === 'whatsapp_click') whatsappClicks30d += 1;
    if (row.action === 'map_click') mapClicks30d += 1;
    if (row.action === 'instagram_click') instagramClicks30d += 1;
    if (row.action === 'save') favorites30d += 1;
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
    views30d,
    whatsappClicks30d,
    mapClicks30d,
    instagramClicks30d,
    favorites30d,
    auditEvents,
  };
}
