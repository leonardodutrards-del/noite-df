import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { partnershipService } from '@/modules/partnerships/service';
import type { AuthUser } from '@/modules/auth/types';

const visitor: AuthUser = {
  id: 'visitor-1',
  email: 'visitor@example.com',
  name: 'Visitor',
  role: 'visitor',
  createdAt: '2026-10-06',
  updatedAt: '2026-10-06',
};

const input = {
  establishmentId: 'existing-place',
  name: 'Existing Place',
  type: 'Bar' as const,
  region: 'Ceilândia',
  address: 'QNM 1, lote 3',
  description: '',
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('reivindicação segura de ficha existente', () => {
  it('usa o ID canônico e não cria um estabelecimento duplicado', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('establishments?id=')) {
        return Response.json([{
          id: input.establishmentId,
          name: input.name,
          region: input.region,
          address: input.address,
          owner_managed: false,
        }]);
      }
      if (url.includes('partner_claims?')) return Response.json([]);
      if (url.endsWith('/partner_claims')) {
        return Response.json([{
          id: 'claim-1',
          establishment_id: input.establishmentId,
          requester_id: visitor.id,
          evidence: {},
          status: 'pending',
          created_at: '2026-10-06',
        }]);
      }
      throw new Error(`Unexpected ${init?.method ?? 'GET'} ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await partnershipService.createClaim(visitor, input);

    expect(result.establishmentId).toBe(input.establishmentId);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).endsWith('/establishments') &&
          init?.method === 'POST'
      )
    ).toBe(false);
  });

  it('recusa identidade divergente antes de registrar o pedido', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    const fetchMock = vi.fn(async () =>
      Response.json([{
        id: input.establishmentId,
        name: 'Outro Local',
        region: input.region,
        address: input.address,
        owner_managed: false,
      }])
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(partnershipService.createClaim(visitor, input)).rejects.toThrow(
      'CLAIM_INVALID_ESTABLISHMENT'
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('recusa ficha que já é gerenciada pelo estabelecimento', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([{
          id: input.establishmentId,
          name: input.name,
          region: input.region,
          address: input.address,
          owner_managed: true,
        }])
      )
    );

    await expect(partnershipService.createClaim(visitor, input)).rejects.toThrow(
      'CLAIM_ALREADY_MANAGED'
    );
  });

  it('preserva o fluxo ficha → login/cadastro → onboarding', () => {
    const publicPage = readFileSync(
      resolve(process.cwd(), 'app/lugar/[slug]/page.tsx'),
      'utf8'
    );
    const onboarding = readFileSync(
      resolve(process.cwd(), 'app/parceiro/onboarding/page.tsx'),
      'utf8'
    );
    const login = readFileSync(resolve(process.cwd(), 'app/login/page.tsx'), 'utf8');
    const signup = readFileSync(resolve(process.cwd(), 'app/cadastro/page.tsx'), 'utf8');

    expect(publicPage).toContain('Solicitar gestão deste perfil');
    expect(publicPage).toContain('?estabelecimento=');
    expect(onboarding).toContain('/api/establishments/');
    expect(onboarding).toContain('establishmentId: establishment.id');
    expect(login).toContain("!redirectPath.startsWith('//')");
    expect(signup).toContain("redirect?.startsWith('/parceiro/onboarding')");
  });
});
