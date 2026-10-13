import { afterEach, describe, expect, it, vi } from 'vitest';
import { aggregateInteractions, getPartnerAnalytics } from '../modules/analytics/service';
import type { AuthUser } from '../modules/auth/types';
const actor = { role: 'partner', establishmentId: 'place-a' } as AuthUser;
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

describe('partner analytics', () => {
  it('separates shares and deduplicates only identified viewing sessions', () => {
    const base = { created_at: '2026-10-13T10:00:00Z' };
    const totals = aggregateInteractions([
      { ...base, action: 'view', anonymous_session_id: 'one' },
      { ...base, action: 'view', anonymous_session_id: 'one' },
      { ...base, action: 'view' },
      { ...base, action: 'view', metadata: { eventName: 'share' }, anonymous_session_id: 'two' },
      { ...base, action: 'whatsapp_click' }, { ...base, action: 'instagram_click' },
      { ...base, action: 'map_click' }, { ...base, action: 'save' },
    ]);
    expect(totals).toMatchObject({ views: 3, shares: 1, uniqueSessions: 1, viewsWithSession: 2, contactClicks: 2, conversionRate: 133.3 });
    expect(aggregateInteractions([]).conversionRate).toBe(0);
  });
  it('rejects access to another establishment before querying', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(getPartnerAnalytics(actor, 'other')).rejects.toThrow('FORBIDDEN');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('paginates past a server cap and compares equal time windows', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-13T12:00:00Z'));
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.test');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test');
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ action: 'view', created_at: '2026-10-06T12:00:00Z' }])))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ action: 'whatsapp_click', created_at: '2026-10-06T11:59:59Z' }])))
      .mockResolvedValueOnce(new Response('[]'));
    vi.stubGlobal('fetch', fetch);
    const result = await getPartnerAnalytics(actor, 'place-a', 7);
    expect(result.views).toBe(1); expect(result.previous.contactClicks).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(new URL(fetch.mock.calls[1][0]).searchParams.get('offset')).toBe('1');
    expect(new URL(fetch.mock.calls[0][0]).searchParams.getAll('created_at')).toEqual(['gte.2026-09-29T12:00:00.000Z', 'lt.2026-10-13T12:00:00.000Z']);
  });
  it('fails visibly instead of returning invented zeros', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    await expect(getPartnerAnalytics(actor, 'place-a')).rejects.toThrow('ANALYTICS_UNAVAILABLE');
  });
});
