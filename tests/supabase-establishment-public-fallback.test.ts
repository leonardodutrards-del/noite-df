import { afterEach, describe, expect, it, vi } from 'vitest';

import { SupabaseEstablishmentRepository } from '@/infrastructure/repositories/supabase-establishment-repository';

describe('public establishment reads', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falls back to the publishable key for published establishments after admin key 401', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'eyJ.invalid.legacy');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'sb_publishable_public');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const row = {
      id: 'place-1',
      slug: 'place-1',
      name: 'Bar de teste',
      type: 'bar',
      description: 'Descrição',
      region: 'Sobradinho',
      address: 'Sobradinho, DF',
      publication_status: 'published',
      created_at: '2026-11-06T12:00:00.000Z',
      updated_at: '2026-11-06T12:00:00.000Z',
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([row]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const places = await new SupabaseEstablishmentRepository().listPublished();

    expect(places).toHaveLength(1);
    expect(places[0].id).toBe('place-1');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const publicHeaders = new Headers(fetchMock.mock.calls[1][1].headers);
    expect(publicHeaders.get('apikey')).toBe('sb_publishable_public');
    expect(publicHeaders.has('authorization')).toBe(false);
  });
});
