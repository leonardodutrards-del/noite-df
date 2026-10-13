import type { AuthUser } from '@/modules/auth/types';

export type Interaction = {
  action: string;
  anonymous_session_id?: string | null;
  created_at: string;
  metadata?: { eventName?: string };
};

export type AnalyticsTotals = {
  views: number;
  uniqueSessions: number;
  viewsWithSession: number;
  shares: number;
  whatsappClicks: number;
  mapClicks: number;
  instagramClicks: number;
  favorites: number;
  contactClicks: number;
  conversionRate: number;
};

export type PartnerAnalytics = AnalyticsTotals & {
  periodDays: number;
  previous: AnalyticsTotals;
};

export function aggregateInteractions(rows: Interaction[]): AnalyticsTotals {
  const sessions = new Set<string>();
  const totals: AnalyticsTotals = {
    views: 0, uniqueSessions: 0, viewsWithSession: 0, shares: 0,
    whatsappClicks: 0, mapClicks: 0, instagramClicks: 0,
    favorites: 0, contactClicks: 0, conversionRate: 0,
  };
  for (const row of rows) {
    // Keep the existing database constraint compatible; classify by event metadata.
    if (row.metadata?.eventName === 'share' || row.action === 'share') {
      totals.shares += 1;
      continue;
    }
    if (row.action === 'view') {
      totals.views += 1;
      if (row.anonymous_session_id) {
        sessions.add(row.anonymous_session_id);
        totals.viewsWithSession += 1;
      }
    }
    if (row.action === 'whatsapp_click') totals.whatsappClicks += 1;
    if (row.action === 'map_click') totals.mapClicks += 1;
    if (row.action === 'instagram_click') totals.instagramClicks += 1;
    if (row.action === 'save') totals.favorites += 1;
  }
  totals.uniqueSessions = sessions.size;
  totals.contactClicks = totals.whatsappClicks + totals.instagramClicks;
  const actions = totals.contactClicks + totals.mapClicks + totals.favorites;
  // This is actions per view, not a sales conversion or a unique-person rate.
  totals.conversionRate = totals.views ? Number((actions / totals.views * 100).toFixed(1)) : 0;
  return totals;
}

export async function getPartnerAnalytics(
  actor: AuthUser,
  establishmentId: string,
  days = 30
): Promise<PartnerAnalytics> {
  if (actor.role !== 'admin' && actor.role !== 'master_admin' && actor.establishmentId !== establishmentId) {
    throw new Error('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
  }
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('ANALYTICS_UNAVAILABLE');

  const now = Date.now();
  const currentSince = now - safeDays * 86400000;
  const rows: Interaction[] = [];
  let offset = 0;
  while (true) {
    const params = new URLSearchParams({
      establishment_id: `eq.${establishmentId}`,
      created_at: `gte.${new Date(now - safeDays * 2 * 86400000).toISOString()}`,
      select: 'action,anonymous_session_id,created_at,metadata',
      order: 'id.asc', limit: '500', offset: String(offset),
    });
    params.append('created_at', `lt.${new Date(now).toISOString()}`);
    const response = await fetch(`${url}/rest/v1/interactions?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store',
    });
    if (!response.ok) throw new Error('ANALYTICS_QUERY_FAILED');
    const page = await response.json() as Interaction[];
    if (!page.length) break;
    rows.push(...page);
    offset += page.length;
  }
  return {
    periodDays: safeDays,
    ...aggregateInteractions(rows.filter(row => Date.parse(row.created_at) >= currentSince)),
    previous: aggregateInteractions(rows.filter(row => Date.parse(row.created_at) < currentSince)),
  };
}
