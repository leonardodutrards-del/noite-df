import type { AuthUser } from '@/modules/auth/types';

export type PartnerAnalytics = {
  periodDays: number;
  available: boolean;
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

  const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;
  const empty: PartnerAnalytics = {
    periodDays: safeDays,
    available: false,
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
  async function count(action: string): Promise<number> {
    const params = new URLSearchParams({
      establishment_id: `eq.${establishmentId}`,
      created_at: `gte.${since}`,
      action: `eq.${action}`,
      select: 'id',
    });
    const response = await fetch(`${cfg!.url}/rest/v1/interactions?${params.toString()}`, {
      headers: {
        apikey: cfg!.key,
        Authorization: `Bearer ${cfg!.key}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('ANALYTICS_QUERY_FAILED');
    const total = response.headers.get('content-range')?.split('/')[1];
    if (!total || total === '*' || !/^\d+$/.test(total)) throw new Error('ANALYTICS_COUNT_UNAVAILABLE');
    return Number(total);
  }

  const [views, whatsappClicks, mapClicks, instagramClicks, favorites] = await Promise.all(
    ['view', 'whatsapp_click', 'map_click', 'instagram_click', 'save'].map(count)
  );
  const metrics = { ...empty, available: true, views, whatsappClicks, mapClicks, instagramClicks, favorites };

  const intentActions =
    metrics.whatsappClicks + metrics.mapClicks + metrics.instagramClicks + metrics.favorites;
  metrics.conversionRate = metrics.views > 0
    ? Number(((intentActions / metrics.views) * 100).toFixed(1))
    : 0;

  return metrics;
}
