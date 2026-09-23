import type { AuthUser } from '@/modules/auth/types';

export type PartnerAnalytics = {
  periodDays: number;
  views: number;
  whatsappClicks: number;
  mapClicks: number;
  instagramClicks: number;
  favorites: number;
  conversionRate: number;
};

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function getPartnerAnalytics(
  actor: AuthUser,
  establishmentId: string,
  days = 30
): Promise<PartnerAnalytics> {
  if (actor.role !== 'admin' && actor.establishmentId !== establishmentId) {
    throw new Error('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
  }

  const safeDays = Math.min(Math.max(Math.trunc(days), 1), 365);
  const empty: PartnerAnalytics = {
    periodDays: safeDays,
    views: 0,
    whatsappClicks: 0,
    mapClicks: 0,
    instagramClicks: 0,
    favorites: 0,
    conversionRate: 0,
  };

  const cfg = config();
  if (!cfg) return empty;

  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    establishment_id: `eq.${establishmentId}`,
    created_at: `gte.${since}`,
    select: 'action',
  });

  const response = await fetch(`${cfg.url}/rest/v1/interactions?${params.toString()}`, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('ANALYTICS_QUERY_FAILED');
  const rows = (await response.json()) as Array<{ action: string }>;

  const metrics = { ...empty };
  for (const row of rows) {
    if (row.action === 'view') metrics.views += 1;
    if (row.action === 'whatsapp_click') metrics.whatsappClicks += 1;
    if (row.action === 'map_click') metrics.mapClicks += 1;
    if (row.action === 'instagram_click') metrics.instagramClicks += 1;
    if (row.action === 'save') metrics.favorites += 1;
  }

  const intentActions =
    metrics.whatsappClicks + metrics.mapClicks + metrics.instagramClicks + metrics.favorites;
  metrics.conversionRate = metrics.views > 0
    ? Number(((intentActions / metrics.views) * 100).toFixed(1))
    : 0;

  return metrics;
}
