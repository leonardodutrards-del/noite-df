import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ admin: vi.fn(), json: vi.fn(), audit: vi.fn() }));
vi.mock('@/modules/auth/session', () => ({ requireMasterAdmin: mocks.admin }));
vi.mock('@/lib/supabase-admin', () => ({ supabaseAdminJson: mocks.json }));
vi.mock('@/modules/auth/service', () => ({ authService: { logAudit: mocks.audit } }));

import { GET, POST } from '@/app/api/admin/event-connectors/route';

const actor = { id: 'admin-1', email: 'owner@example.com', role: 'master_admin' };
const officialSite = {
  id: '11111111-1111-4111-8111-111111111111',
  entity_type: 'establishment', entity_id: 'venue-1', source_kind: 'official',
  label: 'Site oficial', url: 'https://example.org/agenda', verified_at: '2026-11-01T00:00:00Z',
};

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('event connector source safety', () => {
  it('does not offer Instagram or Linktree as automated sources', async () => {
    mocks.admin.mockResolvedValue(actor);
    mocks.json
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        officialSite,
        { ...officialSite, id: '22222222-2222-4222-8222-222222222222', url: 'https://www.instagram.com/venue/' },
        { ...officialSite, id: '33333333-3333-4333-8333-333333333333', url: 'https://linktr.ee/venue' },
      ]);
    const response = await GET(new NextRequest('https://www.noitedf.com.br/api/admin/event-connectors'));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.availableSources.map((source: { url: string }) => source.url)).toEqual(['https://example.org/agenda']);
  });

  it('rejects Linktree as an automated connector source', async () => {
    mocks.admin.mockResolvedValue(actor);
    mocks.json.mockResolvedValueOnce([{
      ...officialSite,
      url: 'https://linktr.ee/venue',
    }]);
    const response = await POST(new NextRequest('https://www.noitedf.com.br/api/admin/event-connectors', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        dataSourceId: officialSite.id,
        connectorType: 'html',
        pollIntervalMinutes: 60,
      }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.json).toHaveBeenCalledTimes(1);
  });

  it('rejects connector types that do not have an implemented adapter', async () => {
    mocks.admin.mockResolvedValue(actor);
    const response = await POST(new NextRequest('https://www.noitedf.com.br/api/admin/event-connectors', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        dataSourceId: officialSite.id,
        connectorType: 'webhook',
        pollIntervalMinutes: 60,
      }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.json).not.toHaveBeenCalled();
  });
});
