import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ json: vi.fn() }));
vi.mock('@/lib/supabase-admin', () => ({ supabaseAdminJson: mocks.json }));

import { GET, POST } from '@/app/api/cron/event-ingestion/route';

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('event ingestion cron endpoint', () => {
  it.each(['GET', 'POST'] as const)('accepts authenticated %s scheduler requests', async (method) => {
    vi.stubEnv('EVENT_INGESTION_CRON_SECRET', 'test-cron-secret');
    mocks.json.mockResolvedValue([]);
    const request = new NextRequest('https://www.noitedf.com.br/api/cron/event-ingestion', {
      method,
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const response = method === 'GET' ? await GET(request) : await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      processed: 0,
      discovered: 0,
      results: [],
      publicationMode: 'manual_review_only',
    });
  });

  it('rejects unauthenticated POST requests', async () => {
    vi.stubEnv('EVENT_INGESTION_CRON_SECRET', 'test-cron-secret');
    const response = await POST(new NextRequest('https://www.noitedf.com.br/api/cron/event-ingestion', { method: 'POST' }));
    expect(response.status).toBe(401);
    expect(mocks.json).not.toHaveBeenCalled();
  });
});
