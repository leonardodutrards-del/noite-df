import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listEditorialEvents: vi.fn(),
  searchEstablishments: vi.fn(),
}));

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => ({ url: 'https://example.supabase.co', serviceRoleKey: 'test-key' }),
}));
vi.mock('@/modules/events/store', () => ({
  listEditorialEvents: mocks.listEditorialEvents,
}));
vi.mock('@/modules/establishments/service', () => ({
  establishmentService: { search: mocks.searchEstablishments },
}));

import { getPublicAgenda } from '@/modules/events/public-agenda';

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('Correção de slug Sympla — Deu Mó Bailão', () => {
  it('prefers the current official event title when Sympla changes the URL slug', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-13T08:00:00-03:00'));

    mocks.listEditorialEvents.mockResolvedValue([{
      id: '978938f4-ce6c-4ef1-8691-98c26ee346f5',
      establishment_id: 'contexto-bar',
      title: 'Deu Mó Love | 13.11 | Varanda do Contexto',
      category: 'Pagode / Funk',
      description: 'Registro anterior da mesma edição.',
      starts_at: '2026-11-13T21:00:00Z',
      ends_at: '2026-11-14T07:00:00Z',
      official_url: 'https://www.sympla.com.br/evento/deu-mo-love-13-11-varanda-do-contexto/3628678',
      price_description: null,
      publication_status: 'published',
      verified_at: '2026-11-12T12:00:00Z',
      updated_at: '2026-11-12T12:00:00Z',
    }]);
    mocks.searchEstablishments.mockResolvedValue([{
      id: 'contexto-bar',
      name: 'Contexto Bar e Restaurante',
      region: 'Setor de Clubes Sul',
      publicationStatus: 'published',
    }]);

    const agenda = await getPublicAgenda();
    const event = agenda.find((item) => item.source?.url?.includes('/3628678'));

    expect(event).toBeDefined();
    expect(event?.title).toBe('Deu Mó Bailão | 13.11 | Varanda do Contexto');
    expect(event?.source?.url).toBe('https://www.sympla.com.br/evento/lgc/3628678');
    expect(agenda.some((item) => item.title === 'Deu Mó Love | 13.11 | Varanda do Contexto')).toBe(false);
  });
});
