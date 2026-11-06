import { afterEach, describe, expect, it, vi } from 'vitest';

import { supabaseAdminRequest } from '@/lib/supabase-admin';

describe('supabase admin request authentication', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('uses the legacy service_role JWT as the Bearer token', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'eyJ.legacy.service-role');
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await supabaseAdminRequest('establishments?select=id');

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('apikey')).toBe('eyJ.legacy.service-role');
    expect(headers.get('authorization')).toBe('Bearer eyJ.legacy.service-role');
  });

  it('uses a modern Supabase secret key without a Bearer header', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb_secret_test-key');
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await supabaseAdminRequest('establishments?select=id');

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('apikey')).toBe('sb_secret_test-key');
    expect(headers.has('authorization')).toBe(false);
  });
});
