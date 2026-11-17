import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => ({ url: 'https://example.supabase.co', serviceRoleKey: 'test-key' }),
}));

vi.mock('@/modules/events/store', () => ({
  listEditorialEvents: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/modules/establishments/service', () => ({
  establishmentService: { search: vi.fn().mockResolvedValue([]) },
}));

import { getPublicAgenda } from '@/modules/events/public-agenda';

afterEach(() => vi.useRealTimers());

describe('Agenda local verificada com Supabase ativo', () => {
  it('inclui o lote de 17/11 e as correções editoriais no caminho usado em produção', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-17T08:00:00-03:00'));

    const agenda = await getPublicAgenda();

    expect(agenda.some((event) => event.id === 'consciencia-negra-babylon-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'noite-na-skina-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'pagodao-das-estrelas-amsterdam-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'marilia-tavares-amsterdam-2026-11-21')).toBe(true);

    const sertanejada = agenda.find((event) => event.id === 'surra-de-modao-contexto-2026-11-18');
    expect(sertanejada?.title).toBe('A Sertajenada convida + Cardápio em Dobro');

    const toma = agenda.find((event) => event.id === 'festa-toma-contexto-2026-11-21');
    expect(toma?.endsAt).toBe('2026-11-22T09:00:00-03:00');
  });
});
