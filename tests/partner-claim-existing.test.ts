import { afterEach, describe, expect, it, vi } from 'vitest';
import { partnershipService } from '@/modules/partnerships/service';
import type { AuthUser } from '@/modules/auth/types';

const visitor: AuthUser = {
  id: 'visitor-1', email: 'visitor@example.com', name: 'Visitor', role: 'visitor',
  createdAt: '2026-09-27', updatedAt: '2026-09-27',
};
const input = {
  establishmentId: 'existing-place', name: 'Existing Place', type: 'Bar' as const,
  region: 'Ceilândia', address: 'QNM 1, lote 3', description: '',
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('claim of an existing public profile', () => {
  it('uses its canonical ID, creates a pending request and never creates a second place', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('establishments?id=')) return Response.json([{
        id: input.establishmentId, name: input.name, region: input.region,
        address: input.address, owner_managed: false,
      }]);
      if (url.includes('partner_claims?')) return Response.json([]);
      if (url.endsWith('/partner_claims')) return Response.json([{
        id: 'claim-1', establishment_id: input.establishmentId,
        requester_id: visitor.id, evidence: {}, status: 'pending', created_at: '2026-09-27',
      }]);
      throw new Error(`Unexpected ${init?.method ?? 'GET'} ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await partnershipService.createClaim(visitor, input);
    expect(result.establishmentId).toBe(input.establishmentId);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.every(([, init]) => !init || init.method !== 'POST' || !String(init.body).includes('publication_status'))).toBe(true);
  });

  it('rejects a stale or forged profile identity before filing a claim', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    const fetchMock = vi.fn(async () => Response.json([{
      id: input.establishmentId, name: 'Different Place', region: input.region,
      address: input.address, owner_managed: false,
    }]));
    vi.stubGlobal('fetch', fetchMock);
    await expect(partnershipService.createClaim(visitor, input)).rejects.toThrow('CLAIM_INVALID_ESTABLISHMENT');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
