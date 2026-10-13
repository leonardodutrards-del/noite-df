import { afterEach, expect, it, vi } from 'vitest';
import { PartnershipService } from '../modules/partnerships/service';
import type { AuthUser } from '../modules/auth/types';
const user = { id: 'owner', email: 'owner@example.test', role: 'visitor', name: 'Owner' } as AuthUser;
const input = { establishmentId: 'contexto-bar', name: 'Contexto Bar e Restaurante', type: 'Bar' as const, address: 'SCES', region: 'Brasília', description: '' };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function setup(existing: unknown[], duplicates: unknown[] = []) {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://db.example.test'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test');
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes('establishments?')) return new Response(JSON.stringify(existing));
    if (!init?.method) return new Response(JSON.stringify(duplicates));
    return new Response(JSON.stringify([{ id: 'claim', ...JSON.parse(String(init.body)) }]));
  }); vi.stubGlobal('fetch', fetch); return fetch;
}
it('requests the existing ID despite a different display name, without creating or overwriting a place', async () => {
  const fetch = setup([{ id: 'contexto-bar', publication_status: 'published' }]);
  const claim = await new PartnershipService().createClaim(user, input);
  expect(claim.establishmentId).toBe('contexto-bar'); expect(claim.status).toBe('pending');
  const writes = fetch.mock.calls.filter(([,init]) => init?.method);
  expect(writes).toHaveLength(1); expect(writes[0][0]).toContain('/partner_claims');
});
it('rejects nonexistent and suspended selected places without writing', async () => {
  for (const existing of [[], [{ id: 'contexto-bar', publication_status: 'suspended' }]]) {
    const fetch = setup(existing);
    await expect(new PartnershipService().createClaim(user,input)).rejects.toThrow('CLAIM_SELECTION_INVALID');
    expect(fetch.mock.calls.filter(([,init]) => init?.method)).toHaveLength(0);
  }
});
it('prevents repeated pending requests for the same selected place', async () => {
  const fetch = setup([{ id: 'contexto-bar', publication_status: 'published' }], [{ id: 'pending' }]);
  await expect(new PartnershipService().createClaim(user,input)).rejects.toThrow('CLAIM_ALREADY_PENDING');
  expect(fetch.mock.calls.filter(([,init]) => init?.method)).toHaveLength(0);
});
