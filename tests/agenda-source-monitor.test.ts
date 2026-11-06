import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ json: vi.fn(), request: vi.fn() }));
vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdminJson: mocks.json,
  supabaseAdminRequest: mocks.request,
}));
import { GET } from '@/app/api/cron/agenda-sources/route';

const request = (authorization?: string) => new NextRequest('https://noitedf.com.br/api/cron/agenda-sources', {
  headers: authorization ? { authorization } : {},
});

describe('agenda source monitor cron', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', 'test-secret');
    mocks.json.mockImplementation(async (path: string) => {
      if (path.startsWith('data_sources?')) return [{ id: '11111111-1111-4111-8111-111111111111', entity_id: 'place-1', label: 'Agenda oficial', url: 'https://agenda.example.com/events', source_kind: 'official' }];
      return [];
    });
    mocks.request.mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>agenda</html>', { status: 200, headers: { 'content-type': 'text/html' } })));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects requests without the configured cron secret', async () => {
    const response = await GET(request('Bearer wrong'));
    expect(response.status).toBe(401);
    expect(mocks.json).not.toHaveBeenCalled();
  });

  it('derives the allowlist from admin-registered official sources', async () => {
    const response = await GET(request('Bearer test-secret'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ checked: 1, authorizedHosts: 1 });
    expect(fetch).toHaveBeenCalledWith(expect.objectContaining({ hostname: 'agenda.example.com' }), expect.anything());
  });

  it('records a baseline without publishing or modifying events', async () => {
    const response = await GET(request('Bearer test-secret'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ checked: 1, changed: 0, errors: 0 });
    expect(mocks.request).toHaveBeenCalledWith('agenda_source_checks', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"check_status":"baseline"'),
    }));
    expect(mocks.request.mock.calls[0][0]).not.toContain('events');
  });

  it('blocks local and private-network source addresses even if allowlisted', async () => {
    mocks.json.mockImplementation(async (path: string) => path.startsWith('data_sources?')
      ? [{ id: '11111111-1111-4111-8111-111111111111', entity_id: 'place-1', label: 'Fonte local', url: 'https://127.0.0.1/private', source_kind: 'official' }]
      : []);
    const response = await GET(request('Bearer test-secret'));
    expect(response.status).toBe(200);
    expect(mocks.request.mock.calls[0][1].body).toContain('"check_status":"blocked"');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('blocks redirects outside the explicit allowlist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { location: 'http://127.0.0.1/private' },
    })));
    const response = await GET(request('Bearer test-secret'));
    expect(response.status).toBe(200);
    expect(mocks.request.mock.calls[0][1].body).toContain('"check_status":"blocked"');
  });
});
