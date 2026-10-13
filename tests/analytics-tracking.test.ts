import { afterEach, expect, it, vi } from 'vitest';
import { track } from '../lib/analytics';
import { POST } from '../app/api/analytics/track/route';
import { NextRequest } from 'next/server';
const insertRow = vi.hoisted(() => vi.fn().mockResolvedValue({ persisted: true }));
vi.mock('../lib/supabase-rest', () => ({ insertRow }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
it('reuses an anonymous tab identifier and records the original share event', async () => {
  const data = new Map<string, string>();
  const fetch = vi.fn().mockResolvedValue({});
  vi.stubGlobal('window', { location: { pathname: '/lugar/a' }, crypto: { randomUUID: () => 'session-a' }, sessionStorage: { getItem: (k: string) => data.get(k), setItem: (k: string, v: string) => data.set(k, v) } });
  vi.stubGlobal('fetch', fetch);
  track('share', { placeId: 'a' }); track('map_click', { placeId: 'a' });
  expect(JSON.parse(fetch.mock.calls[0][1].body).sessionId).toBe('session-a');
  expect(JSON.parse(fetch.mock.calls[1][1].body).sessionId).toBe('session-a');
  const response = await POST(new NextRequest('http://localhost/api/analytics/track', { method: 'POST', body: fetch.mock.calls[0][1].body }));
  expect(response.status).toBe(202);
  expect(insertRow).toHaveBeenCalledWith('interactions', expect.objectContaining({ establishment_id: 'a', anonymous_session_id: 'session-a', metadata: expect.objectContaining({ eventName: 'share' }) }));
});
it('still tracks if session storage is unavailable', () => {
  const fetch = vi.fn().mockResolvedValue({}); vi.stubGlobal('fetch', fetch);
  vi.stubGlobal('window', { location: { pathname: '/' }, sessionStorage: { getItem: () => { throw new Error('blocked'); } } });
  expect(() => track('page_view')).not.toThrow();
  expect(JSON.parse(fetch.mock.calls[0][1].body).sessionId).toBeUndefined();
});
