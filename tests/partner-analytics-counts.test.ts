import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPartnerAnalytics } from '@/modules/analytics/service';
import type { AuthUser } from '@/modules/auth/types';

const partner: AuthUser = {
  id: 'partner-1', email: 'partner@example.com', name: 'Partner', role: 'partner',
  establishmentId: 'bar-1', createdAt: '2026-09-27', updatedAt: '2026-09-27',
};

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('partner analytics', () => {
  it('uses exact server counts even above the default 1000-row response limit', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    const totals: Record<string, number> = {
      view: 1501, whatsapp_click: 9, map_click: 12,
      instagram_click: 6, save: 3,
    };
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      const request = new URL(url);
      expect(request.searchParams.get('establishment_id')).toBe('eq.bar-1');
      expect(init.headers).toMatchObject({ Prefer: 'count=exact', Range: '0-0' });
      const action = request.searchParams.get('action')?.replace('eq.', '') ?? '';
      return new Response('[]', { headers: { 'content-range': `*/${totals[action]}` } });
    });
    vi.stubGlobal('fetch', fetchMock);

    const analytics = await getPartnerAnalytics(partner, 'bar-1');
    expect(analytics).toMatchObject({
      available: true, views: 1501, whatsappClicks: 9,
      mapClicks: 12, instagramClicks: 6, favorites: 3,
      conversionRate: 2,
    });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('does not show missing persistence as real zero traffic', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    expect(await getPartnerAnalytics(partner, 'bar-1')).toMatchObject({ available: false, views: 0 });
    await expect(getPartnerAnalytics(partner, 'another-place')).rejects.toThrow('FORBIDDEN');
  });
});
